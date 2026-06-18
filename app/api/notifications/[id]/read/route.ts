import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type MarkNotificationReadContext = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: MarkNotificationReadContext
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
    const notificationId = Number(id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return Response.json(
        {
          success: false,
          message: "通知 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      select: {
        id: true,
        userId: true,
        isRead: true,
      },
    });

    if (!notification) {
      return Response.json(
        {
          success: false,
          message: "通知不存在",
        },
        {
          status: 404,
        }
      );
    }

    if (notification.userId !== currentUser.id) {
      return Response.json(
        {
          success: false,
          message: "没有权限操作这条通知",
        },
        {
          status: 403,
        }
      );
    }

    if (!notification.isRead) {
      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
        },
      });
    }

    return Response.json({
      success: true,
      message: "通知已标记为已读",
    });
  } catch (error) {
    console.error("标记通知已读失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器标记通知已读失败",
      },
      {
        status: 500,
      }
    );
  }
}
