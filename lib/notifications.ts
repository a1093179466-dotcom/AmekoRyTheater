import { prisma } from "@/lib/prisma";

type CreateAdminNotificationsInput = {
  actorUserId: number;
  type: string;
  title: string;
  content: string;
  linkUrl: string;
};

/**
 * 给所有管理员创建站内通知。
 *
 * 互动通知不能影响点赞、收藏、支付等主流程，所以这里内部捕获错误。
 */
export async function createAdminNotifications({
  actorUserId,
  type,
  title,
  content,
  linkUrl,
}: CreateAdminNotificationsInput) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    const recipients = admins.filter((admin) => admin.id !== actorUserId);

    if (recipients.length === 0) {
      return;
    }

    await prisma.notification.createMany({
      data: recipients.map((admin) => ({
        userId: admin.id,
        type,
        title,
        content,
        linkUrl,
      })),
    });
  } catch (error) {
    console.error("创建管理员通知失败：", error);
  }
}
