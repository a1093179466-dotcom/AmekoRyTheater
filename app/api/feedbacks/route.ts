import { getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import {
  feedbackStatuses,
  isFeedbackType,
} from "@/lib/feedback";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();

    const type = normalizeString(body.type);
    const title = normalizeString(body.title);
    const content = normalizeString(body.content);
    const emailInput = normalizeString(body.email);

    if (!isFeedbackType(type)) {
      return Response.json(
        {
          success: false,
          message: "请选择反馈类型",
        },
        {
          status: 400,
        }
      );
    }

    if (!title) {
      return Response.json(
        {
          success: false,
          message: "反馈标题不能为空",
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
          message: "反馈内容不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (emailInput && !isValidEmail(emailInput)) {
      return Response.json(
        {
          success: false,
          message: "联系邮箱格式不正确",
        },
        {
          status: 400,
        }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: currentUser?.id ?? null,
        email: emailInput || currentUser?.email || null,
        type,
        title: truncate(title, 120),
        content: truncate(content, 3000),
      },
      select: {
        id: true,
      },
    });

    return Response.json({
      success: true,
      message: "反馈已提交，感谢你的帮助",
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error("提交反馈失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器提交反馈失败，请稍后再试",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限查看反馈",
        },
        {
          status: 403,
        }
      );
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      statuses: feedbackStatuses,
      feedbacks,
    });
  } catch (error) {
    console.error("读取反馈列表失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器读取反馈列表失败",
      },
      {
        status: 500,
      }
    );
  }
}
