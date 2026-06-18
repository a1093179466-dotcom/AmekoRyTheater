import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploadFile";

export const runtime = "nodejs";

/**
 * 创建帖子 API
 *
 * 支持：
 * - 作品 / 公告
 * - 免费 / 付费
 * - 封面图上传
 * - 多张作品预览图 galleryImages
 */
export async function POST(request: Request) {
  try {
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
    const accessType = String(formData.get("accessType") || "FREE");

    const isPublished =
      String(formData.get("isPublished")) === "true";

    const isPinned =
      String(formData.get("isPinned")) === "true";

    const price = Number(formData.get("price") || 0);

    const image = formData.get("image");
    const galleryImages = formData.getAll("galleryImages");

    const type = rawType === "NOTICE" ? "NOTICE" : "WORK";

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

    const isPaid = type === "WORK" && accessType === "PAID";
    const finalPrice = isPaid ? price : 0;

    if (isPaid && finalPrice <= 0) {
      return Response.json(
        {
          success: false,
          message: "付费作品价格必须大于 0",
        },
        {
          status: 400,
        }
      );
    }

    let coverImage = "/images/test1.jpg";

    if (image instanceof File && image.size > 0) {
      try {
        coverImage = await saveUploadedImage(image, "posts");
      } catch (error) {
        return Response.json(
          {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "封面图上传失败",
          },
          {
            status: 400,
          }
        );
      }
    }

    const galleryImageUrls: string[] = [];

    for (const item of galleryImages) {
      if (!(item instanceof File) || item.size <= 0) {
        continue;
      }

      try {
        const imageUrl = await saveUploadedImage(item, "post-images");
        galleryImageUrls.push(imageUrl);
      } catch (error) {
        return Response.json(
          {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "作品预览图上传失败",
          },
          {
            status: 400,
          }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        type,
        title,
        excerpt,
        content,
        previewContent,
        paidContent: isPaid ? paidContent : "",
        coverImage,
        downloadUrl: isPaid && downloadUrl ? downloadUrl : null,
        downloadCode: isPaid && downloadCode ? downloadCode : null,
        author: "AmekoRy",
        isPaid,
        price: finalPrice,
        isPublished,
        isPinned,

        images:
          galleryImageUrls.length > 0
            ? {
                create: galleryImageUrls.map((imageUrl, index) => ({
                  imageUrl,
                  sortOrder: index,
                })),
              }
            : undefined,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
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