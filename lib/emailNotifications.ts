import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type SendCommentReplyEmailNotificationInput = {
  recipientUserId: number;
  actorUserId: number;
  actorName: string;
  postId: number;
  postTitle: string;
  replyContent: string;
};

type SendPurchaseEmailNotificationInput = {
  userId: number;
  postId: number;
  postTitle: string;
  orderId: number;
};

function getSiteUrl(path: string) {
  const baseUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return new URL(path, baseUrl).toString();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summarize(value: string, maxLength = 100) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

export async function sendCommentReplyEmailNotification({
  recipientUserId,
  actorUserId,
  actorName,
  postId,
  postTitle,
  replyContent,
}: SendCommentReplyEmailNotificationInput) {
  if (recipientUserId === actorUserId) {
    return;
  }

  try {
    const recipient = await prisma.user.findUnique({
      where: {
        id: recipientUserId,
      },
      select: {
        email: true,
        emailNotifyCommentReply: true,
      },
    });

    if (!recipient?.emailNotifyCommentReply) {
      return;
    }

    const postUrl = getSiteUrl(`/gallery/${postId}`);
    const replySummary = summarize(replyContent);
    const safeActorName = escapeHtml(actorName);
    const safePostTitle = escapeHtml(postTitle);
    const safeReplySummary = escapeHtml(replySummary);
    const safePostUrl = escapeHtml(postUrl);

    const result = await sendEmail({
      to: recipient.email,
      subject: "你的评论收到了回复",
      text: `${actorName} 回复了你在《${postTitle}》下的评论：${replySummary}\n\n查看作品：${postUrl}`,
      html: `<p>${safeActorName} 回复了你在《${safePostTitle}》下的评论：</p><p>${safeReplySummary}</p><p><a href="${safePostUrl}">查看作品</a></p>`,
    });

    if (!result.success) {
      console.error("发送评论回复邮件通知失败：", {
        recipientUserId,
        postId,
        provider: result.provider,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("发送评论回复邮件通知异常：", {
      recipientUserId,
      postId,
      error,
    });
  }
}

export async function sendPurchaseEmailNotification({
  userId,
  postId,
  postTitle,
  orderId,
}: SendPurchaseEmailNotificationInput) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
        emailNotifyPurchase: true,
      },
    });

    if (!user?.emailNotifyPurchase) {
      return;
    }

    const postUrl = getSiteUrl(`/gallery/${postId}`);
    const safePostTitle = escapeHtml(postTitle);
    const safePostUrl = escapeHtml(postUrl);

    const result = await sendEmail({
      to: user.email,
      subject: `作品已解锁：${postTitle}`,
      text: `你购买的《${postTitle}》已经解锁，可以开始查看内容。\n\n查看作品：${postUrl}`,
      html: `<p>你购买的《${safePostTitle}》已经解锁，可以开始查看内容。</p><p><a href="${safePostUrl}">查看作品</a></p>`,
    });

    if (!result.success) {
      console.error("发送购买成功邮件通知失败：", {
        userId,
        orderId,
        postId,
        provider: result.provider,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("发送购买成功邮件通知异常：", {
      userId,
      orderId,
      postId,
      error,
    });
  }
}