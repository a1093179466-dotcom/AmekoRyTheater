import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * 创建评论 API
 *
 * 现在的规则：
 * 1. 必须登录才能评论
 * 2. 评论会绑定当前登录用户的 userId
 * 3. username 使用当前用户昵称
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    // 未登录用户不能发表评论
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "请先登录后再发表评论",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const postId = Number(body.postId);
    const content = String(body.content || "").trim();

    if (!postId) {
      return Response.json(
        {
          success: false,
          message: "postId 无效",
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
          message: "评论内容不能为空",
        },
        {
          status: 400,
        }
      );
    }

    // 确认帖子存在，避免给不存在的帖子写评论
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

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        username: user.name,
        content,
      },
      select: {
        id: true,
        postId: true,
        userId: true,
        username: true,
        content: true,
        createdAt: true,
      },
    });

    return Response.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("创建评论失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器创建评论失败",
      },
      {
        status: 500,
      }
    );
  }
}