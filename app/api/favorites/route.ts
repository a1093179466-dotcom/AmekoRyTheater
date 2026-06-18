import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    await prisma.favorite.upsert({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: post.id,
        },
      },
      update: {},
      create: {
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
