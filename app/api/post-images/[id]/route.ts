import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function deletePostImageFile(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/")) {
    return;
  }

  const relativePath = fileUrl.replace(/^\/+/, "");
  const postImagesRoot = path.resolve(
    process.cwd(),
    "public",
    "uploads",
    "post-images"
  );
  const filePath = path.resolve(process.cwd(), "public", relativePath);

  if (
    filePath !== postImagesRoot &&
    !filePath.startsWith(`${postImagesRoot}${path.sep}`)
  ) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    console.log("作品图文件不存在或已经被删除：", filePath);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限删除作品图",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await context.params;
    const imageId = Number(id);

    if (Number.isNaN(imageId)) {
      return Response.json(
        {
          success: false,
          message: "作品图 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const image = await prisma.postImage.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      return Response.json(
        {
          success: false,
          message: "作品图不存在",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.postImage.delete({
      where: {
        id: imageId,
      },
    });

    await deletePostImageFile(image.imageUrl);

    return Response.json({
      success: true,
      message: "作品图已删除",
    });
  } catch (error) {
    console.error("删除作品图失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器删除作品图失败",
      },
      {
        status: 500,
      }
    );
  }
}
