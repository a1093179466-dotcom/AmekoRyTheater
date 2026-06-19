import { isCurrentUserAdmin } from "@/lib/auth";
import { isFeedbackStatus } from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限修改反馈状态",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await context.params;
    const feedbackId = Number(id);

    if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
      return Response.json(
        {
          success: false,
          message: "反馈 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : "";

    if (!isFeedbackStatus(status)) {
      return Response.json(
        {
          success: false,
          message: "反馈状态无效",
        },
        {
          status: 400,
        }
      );
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        id: feedbackId,
      },
      select: {
        id: true,
      },
    });

    if (!existingFeedback) {
      return Response.json(
        {
          success: false,
          message: "?????",
        },
        {
          status: 404,
        }
      );
    }

    const feedback = await prisma.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return Response.json({
      success: true,
      message: "反馈状态已更新",
      feedback,
    });
  } catch (error) {
    console.error("修改反馈状态失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器修改反馈状态失败",
      },
      {
        status: 500,
      }
    );
  }
}
