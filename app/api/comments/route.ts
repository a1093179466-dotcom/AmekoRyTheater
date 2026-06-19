import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAdminNotifications } from "@/lib/notifications";
import { sendCommentReplyEmailNotification } from "@/lib/emailNotifications";

export const runtime = "nodejs";

function parseOptionalParentId(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parentId = Number(value);

  if (!Number.isInteger(parentId) || parentId <= 0) {
    return undefined;
  }

  return parentId;
}

/**
 * 创建评论 API。
 *
 * 支持一级评论和一级回复。第一轮不做多级楼中楼：
 * 如果 parentId 指向一条回复，会自动归到原始一级评论下。
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

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
    const requestedParentId = parseOptionalParentId(body.parentId);

    if (!Number.isInteger(postId) || postId <= 0) {
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

    if (requestedParentId === undefined) {
      return Response.json(
        {
          success: false,
          message: "parentId 无效",
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
        title: true,
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

    let parentId: number | null = null;
    let notificationTargetUserId: number | null = null;

    if (requestedParentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: requestedParentId,
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
          userId: true,
        },
      });

      if (!parentComment) {
        return Response.json(
          {
            success: false,
            message: "被回复的评论不存在",
          },
          {
            status: 404,
          }
        );
      }

      if (parentComment.postId !== post.id) {
        return Response.json(
          {
            success: false,
            message: "不能回复其他作品下的评论",
          },
          {
            status: 400,
          }
        );
      }

      parentId = parentComment.parentId ?? parentComment.id;
      notificationTargetUserId = parentComment.userId;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        username: user.name,
        content,
        parentId,
      },
      select: {
        id: true,
        postId: true,
        userId: true,
        parentId: true,
        username: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const summary =
      content.length > 80 ? `${content.slice(0, 80)}...` : content;

    if (parentId && notificationTargetUserId && notificationTargetUserId !== user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: notificationTargetUserId,
            type: "COMMENT_REPLY",
            title: "你的评论收到了回复",
            content: `${user.name} 回复了你：${summary}`,
            linkUrl: `/gallery/${post.id}`,
          },
        });
      } catch (notificationError) {
        console.error("创建评论回复通知失败：", notificationError);
      }

      await sendCommentReplyEmailNotification({
        recipientUserId: notificationTargetUserId,
        actorUserId: user.id,
        actorName: user.name,
        postId: post.id,
        postTitle: post.title,
        replyContent: content,
      });
    }

    if (!parentId) {
      await createAdminNotifications({
        actorUserId: user.id,
        type: "POST_COMMENTED",
        title: "帖子收到了新的评论",
        content: `用户 ${user.name} 评论了《${post.title}》：${summary}`,
        linkUrl: `/gallery/${post.id}`,
      });
    }

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
