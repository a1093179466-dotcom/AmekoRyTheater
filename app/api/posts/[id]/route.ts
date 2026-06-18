import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

import { saveUploadedImage } from "@/lib/uploadFile";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function deletePublicUploadFile(fileUrl: string | null) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const relativePath = fileUrl.replace(/^\/+/, "");

  const filePath = path.join(
    process.cwd(),
    "public",
    relativePath
  );

  try {
    await unlink(filePath);
  } catch {
    console.log("上传文件不存在或已经被删除：", filePath);
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
      include: {
        images: true,
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

    await deletePublicUploadFile(post.coverImage);

    for (const image of post.images) {
      await deletePublicUploadFile(image.imageUrl);
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

    const oldPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        images: true,
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
        {
          success: false,
          message: "标题不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (!excerpt) {
      return Response.json(
        {
          success: false,
          message: "简介不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return Response.json(
        {
          success: false,
          message: "正文不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (Number.isNaN(price) || price < 0) {
      return Response.json(
        {
          success: false,
          message: "价格必须是大于等于 0 的数字",
        },
        {
          status: 400,
        }
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

    let coverImage = oldPost.coverImage;

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

    const nextSortOrder =
      oldPost.images.length > 0
        ? Math.max(...oldPost.images.map((item) => item.sortOrder)) + 1
        : 0;

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

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
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
        isPaid,
        price: finalPrice,
        isPublished,
        isPinned,

        images:
          galleryImageUrls.length > 0
            ? {
                create: galleryImageUrls.map((imageUrl, index) => ({
                  imageUrl,
                  sortOrder: nextSortOrder + index,
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

    if (coverImage !== oldPost.coverImage) {
      await deletePublicUploadFile(oldPost.coverImage);
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