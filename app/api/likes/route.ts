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

async function getLikeCount(postId: number) {
  return prisma.like.count({
    where: {
      postId,
    },
  });
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

    await prisma.like.upsert({
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
