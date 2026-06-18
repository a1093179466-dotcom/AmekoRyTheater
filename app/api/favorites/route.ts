import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAdminNotifications } from "@/lib/notifications";

export const runtime = "nodejs";

async function readPostId(request: Request) {
  try {
    const body = await request.json();
    const postId = Number(body.postId);

    if (!Number.isInteger(postId) || postId <= 0) {
      return null;
    }

    return postId;
  } catch {
    return null;
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "请先登录后再收藏作品",
        },
        {
          status: 401,
        }
      );
    }

    const postId = await readPostId(request);

    if (!postId) {
      return Response.json(
        {
          success: false,
          message: "作品 ID 无效",
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
      select: {
        id: true,
        type: true,
        title: true,
      },
    });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "作品不存在",
        },
        {
          status: 404,
        }
      );
    }

    if (post.type !== "WORK") {
      return Response.json(
        {
          success: false,
          message: "公告不能收藏",
        },
        {
          status: 400,
        }
      );
    }

    let createdFavorite = false;

    try {
      await prisma.favorite.create({
        data: {
          userId: currentUser.id,
          postId: post.id,
        },
      });
      createdFavorite = true;
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }

    if (createdFavorite) {
      await createAdminNotifications({
        actorUserId: currentUser.id,
        type: "POST_FAVORITED",
        title: "作品被收藏了",
        content: `用户 ${currentUser.name} 收藏了《${post.title}》`,
        linkUrl: `/gallery/${post.id}`,
      });
    }

    const favoriteCount = await prisma.favorite.count({
      where: {
        postId: post.id,
      },
    });

    return Response.json({
      success: true,
      message: "作品已收藏",
      favorited: true,
      favoriteCount,
    });
  } catch (error) {
    console.error("收藏作品失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器收藏作品失败",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "请先登录后再取消收藏",
        },
        {
          status: 401,
        }
      );
    }

    const postId = await readPostId(request);

    if (!postId) {
      return Response.json(
        {
          success: false,
          message: "作品 ID 无效",
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
      select: {
        id: true,
      },
    });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "作品不存在",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: currentUser.id,
        postId: post.id,
      },
    });

    const favoriteCount = await prisma.favorite.count({
      where: {
        postId: post.id,
      },
    });

    return Response.json({
      success: true,
      message: "已取消收藏",
      favorited: false,
      favoriteCount,
    });
  } catch (error) {
    console.error("取消收藏作品失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器取消收藏失败",
      },
      {
        status: 500,
      }
    );
  }
}
