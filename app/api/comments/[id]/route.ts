import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type DeleteCommentContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";

/**
 * 删除评论 API。
 *
 * 管理员可以删除任意评论或回复；普通用户只能删除自己的评论或回复。
 * 删除一级评论时会同时删除它下面的一级回复，避免留下孤儿回复。
 */
export async function DELETE(
  _request: Request,
  context: DeleteCommentContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "请先登录",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;
    const commentId = Number(id);

    if (!Number.isInteger(commentId) || commentId <= 0) {
      return Response.json(
        {
          success: false,
          message: "评论 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        userId: true,
        parentId: true,
      },
    });

    if (!comment) {
      return Response.json(
        {
          success: false,
          message: "评论不存在",
        },
        {
          status: 404,
        }
      );
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isOwner = comment.userId === currentUser.id;

    if (!isAdmin && !isOwner) {
      return Response.json(
        {
          success: false,
          message: "没有权限删除这条评论",
        },
        {
          status: 403,
        }
      );
    }

    const deletedReplyIds: number[] = [];

    if (comment.parentId === null) {
      const replies = await prisma.comment.findMany({
        where: {
          parentId: comment.id,
        },
        select: {
          id: true,
        },
      });

      deletedReplyIds.push(...replies.map((reply) => reply.id));

      await prisma.$transaction([
        prisma.comment.deleteMany({
          where: {
            parentId: comment.id,
          },
        }),
        prisma.comment.delete({
          where: {
            id: comment.id,
          },
        }),
      ]);
    } else {
      await prisma.comment.delete({
        where: {
          id: comment.id,
        },
      });
    }

    return Response.json({
      success: true,
      message: "评论已删除",
      deletedCommentId: comment.id,
      deletedReplyIds,
    });
  } catch (error) {
    console.error("删除评论失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器删除评论失败",
      },
      {
        status: 500,
      }
    );
  }
}
