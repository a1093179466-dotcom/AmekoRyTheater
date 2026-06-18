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

async function getLikeCount(postId: number) {
  return prisma.like.count({
    where: {
      postId,
    },
  });
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
          message: "请先登录后再点赞",
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
          message: "公告不能点赞",
        },
        {
          status: 400,
        }
      );
    }

    let createdLike = false;

    try {
      await prisma.like.create({
        data: {
          userId: currentUser.id,
          postId: post.id,
        },
      });
      createdLike = true;
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }

    if (createdLike) {
      await createAdminNotifications({
        actorUserId: currentUser.id,
        type: "POST_LIKED",
        title: "作品收到了新的点赞",
        content: `用户 ${currentUser.name} 点赞了《${post.title}》`,
        linkUrl: `/gallery/${post.id}`,
      });
    }

    const likeCount = await getLikeCount(post.id);

    return Response.json({
      success: true,
      message: "作品已点赞",
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error("点赞作品失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器点赞作品失败",
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
          message: "请先登录后再取消点赞",
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
          message: "公告不能点赞",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.like.deleteMany({
      where: {
        userId: currentUser.id,
        postId: post.id,
      },
    });

    const likeCount = await getLikeCount(post.id);

    return Response.json({
      success: true,
      message: "已取消点赞",
      liked: false,
      likeCount,
    });
  } catch (error) {
    console.error("取消点赞作品失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器取消点赞失败",
      },
      {
        status: 500,
      }
    );
  }
}
