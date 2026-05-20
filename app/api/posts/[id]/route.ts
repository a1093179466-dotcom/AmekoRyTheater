import { prisma } from "@/lib/prisma";

import { unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const postId = Number(id);

    if (Number.isNaN(postId)) {
      return Response.json(
        {
          success: false,
          message: "帖子 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "帖子不存在",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (post.coverImage.startsWith("/uploads/")) {
      const relativePath = post.coverImage.replace(/^\/+/, "");

      const filePath = path.join(
        process.cwd(),
        "public",
        relativePath
      );

      try {
        await unlink(filePath);
      } catch {
        console.log("封面文件不存在或已经被删除：", filePath);
      }
    }

    return Response.json({
      success: true,
      message: "帖子已删除",
    });
  } catch (error) {
    console.error("删除帖子失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器删除帖子失败",
      },
      {
        status: 500,
      }
    );
  }
}