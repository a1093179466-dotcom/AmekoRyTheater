import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // API 权限检查：只有管理员可以创建帖子
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限创建帖子",
        },
        {
          status: 403,
        }
      );
    }
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const price = Number(formData.get("price") || 0);

    const image = formData.get("image");

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

    let coverImage = "/images/test1.jpg";

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

    const post = await prisma.post.create({
      data: {
        title,
        excerpt,
        content,
        coverImage,
        author: "AmekoRy",
        isPaid: price > 0,
        price,
      },
    });

    return Response.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("创建帖子失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器创建帖子失败",
      },
      {
        status: 500,
      }
    );
  }
}