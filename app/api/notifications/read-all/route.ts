import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
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

    const result = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return Response.json({
      success: true,
      message: "全部通知已标记为已读",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("全部标记通知已读失败：", error);

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
