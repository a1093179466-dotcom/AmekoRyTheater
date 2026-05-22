import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 删除评论 API
 *
 * 权限规则：
 * 1. 未登录用户不能删除评论
 * 2. 评论作者本人可以删除自己的评论
 * 3. 管理员可以删除任何评论
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    // 没登录，直接拒绝
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

    // 校验 URL 里的评论 ID 是否有效
    if (Number.isNaN(commentId)) {
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

    // 先查出评论，后面要判断这条评论是谁发的
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
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

    // 不是管理员，也不是评论作者本人，就不能删除
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

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return Response.json({
      success: true,
      message: "评论已删除",
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