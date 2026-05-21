import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
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
    // API 权限检查：只有管理员可以删除帖子
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限删除帖子",
        },
        {
          status: 403,
        }
      );
    }
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
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
        // API 权限检查：只有管理员可以编辑帖子
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限编辑帖子",
        },
        {
          status: 403,
        }
      );
    }
    const { id } = await context.params;
    const postId = Number(id);

    // 1. 校验 URL 里的帖子 ID 是否有效
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

    // 2. 先查询旧帖子，后面需要用旧封面路径
    const oldPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!oldPost) {
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

    // 3. 编辑帖子同样使用 FormData，因为可能会上传新封面图
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const price = Number(formData.get("price") || 0);
    const image = formData.get("image");

    // 4. 基础表单校验
    if (!title) {
      return Response.json(
        { success: false, message: "标题不能为空" },
        { status: 400 }
      );
    }

    if (!excerpt) {
      return Response.json(
        { success: false, message: "简介不能为空" },
        { status: 400 }
      );
    }

    if (!content) {
      return Response.json(
        { success: false, message: "正文不能为空" },
        { status: 400 }
      );
    }

    if (Number.isNaN(price) || price < 0) {
      return Response.json(
        { success: false, message: "价格必须是大于等于 0 的数字" },
        { status: 400 }
      );
    }

    // 5. 默认继续使用旧封面
    let coverImage = oldPost.coverImage;

    // 6. 如果用户上传了新图片，就保存新图片
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "只能上传图片文件" },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;

      if (image.size > maxSize) {
        return Response.json(
          { success: false, message: "图片不能超过 5MB" },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalExtension = image.name.split(".").pop() || "jpg";
      const safeExtension = originalExtension.toLowerCase();
      const fileName = `${randomUUID()}.${safeExtension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads"
      );

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      coverImage = `/uploads/${fileName}`;
    }

    // 7. 更新数据库里的帖子信息
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        excerpt,
        content,
        coverImage,
        isPaid: price > 0,
        price,
      },
    });

    // 8. 如果上传了新封面，并且旧封面也是上传文件，就删除旧封面
    if (
      coverImage !== oldPost.coverImage &&
      oldPost.coverImage.startsWith("/uploads/")
    ) {
      const relativePath = oldPost.coverImage.replace(/^\/+/, "");

      const oldFilePath = path.join(
        process.cwd(),
        "public",
        relativePath
      );

      try {
        await unlink(oldFilePath);
      } catch {
        console.log("旧封面文件不存在或已经被删除：", oldFilePath);
      }
    }

    return Response.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("编辑帖子失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器编辑帖子失败",
      },
      {
        status: 500,
      }
    );
  }
}