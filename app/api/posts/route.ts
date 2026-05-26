import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

/**
 * 创建帖子 API
 *
 * 请求路径：
 * POST /api/posts
 *
 * 作用：
 * 管理员在后台发布新帖子时调用。
 *
 * 现在支持：
 * - 普通作品帖 WORK
 * - 公告帖 NOTICE
 * - 免费预览内容
 * - 付费隐藏内容
 * - 下载链接 / 提取码
 * - 封面图上传
 * - 是否发布
 * - 是否置顶
 */
export async function POST(request: Request) {
  try {
    // API 权限检查：
    // 即使别人绕过 dashboard 页面直接请求 API，
    // 后端也会再次确认当前用户是不是管理员。
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

    // 因为发布帖子可能包含封面图片，
    // 所以这里使用 formData，而不是 request.json()。
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();

    const previewContent = String(
      formData.get("previewContent") || ""
    ).trim();

    const paidContent = String(
      formData.get("paidContent") || ""
    ).trim();

    const downloadUrl = String(
      formData.get("downloadUrl") || ""
    ).trim();

    const downloadCode = String(
      formData.get("downloadCode") || ""
    ).trim();

    const rawType = String(formData.get("type") || "WORK");

    // 表单传来的 checkbox 字符串转成 boolean。
    // 前端会传 "true" 或 "false"。
    const isPublished =
      String(formData.get("isPublished")) === "true";

    const isPinned =
      String(formData.get("isPinned")) === "true";

    const price = Number(formData.get("price") || 0);

    const image = formData.get("image");

    // 只允许这两种帖子类型。
    // 避免前端传入乱七八糟的 type。
    const type =
      rawType === "NOTICE" ? "NOTICE" : "WORK";

    // 基础表单校验
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
        {
          success: false,
          message: "价格必须是大于等于 0 的数字",
        },
        { status: 400 }
      );
    }

    // 公告帖不应该设置为付费内容。
    // 所以如果 type 是 NOTICE，就强制价格为 0。
    const finalPrice = type === "NOTICE" ? 0 : price;

    // 价格大于 0，就认为这是付费作品。
    const isPaid = type === "WORK" && finalPrice > 0;

    // 默认封面。
    // 如果用户上传了封面，下面会替换成真实上传路径。
    let coverImage = "/images/test1.jpg";

    // 处理封面图片上传。
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return Response.json(
          { success: false, message: "只能上传图片文件" },
          { status: 400 }
        );
      }

      // 限制图片最大 5MB。
      const maxSize = 5 * 1024 * 1024;

      if (image.size > maxSize) {
        return Response.json(
          { success: false, message: "图片不能超过 5MB" },
          { status: 400 }
        );
      }

      // 把浏览器传来的 File 转成 Node.js 可以写入磁盘的 Buffer。
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalExtension = image.name.split(".").pop() || "jpg";
      const safeExtension = originalExtension.toLowerCase();

      // 用 UUID 生成文件名，避免不同图片重名覆盖。
      const fileName = `${randomUUID()}.${safeExtension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads"
      );

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      // 保存到数据库里的不是磁盘绝对路径，
      // 而是浏览器可以访问的 public 路径。
      coverImage = `/uploads/${fileName}`;
    }

    const post = await prisma.post.create({
      data: {
        type,
        title,
        excerpt,
        content,
        previewContent,
        paidContent,
        coverImage,
        downloadUrl: downloadUrl || null,
        downloadCode: downloadCode || null,
        author: "AmekoRy",
        isPaid,
        price: finalPrice,
        isPublished,
        isPinned,
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