import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const preferenceSelect = {
  emailNotifyCommentReply: true,
  emailNotifyPurchase: true,
  emailNotifyNewPost: true,
};

function buildUnauthorizedResponse() {
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

function pickBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return buildUnauthorizedResponse();
    }

    const preferences = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: preferenceSelect,
    });

    if (!preferences) {
      return buildUnauthorizedResponse();
    }

    return Response.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("读取账户设置失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器读取账户设置失败",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return buildUnauthorizedResponse();
    }

    const body = await request.json();

    const currentPreferences = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: preferenceSelect,
    });

    if (!currentPreferences) {
      return buildUnauthorizedResponse();
    }

    const preferences = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        emailNotifyCommentReply: pickBoolean(
          body.emailNotifyCommentReply,
          currentPreferences.emailNotifyCommentReply
        ),
        emailNotifyPurchase: pickBoolean(
          body.emailNotifyPurchase,
          currentPreferences.emailNotifyPurchase
        ),
        emailNotifyNewPost: pickBoolean(
          body.emailNotifyNewPost,
          currentPreferences.emailNotifyNewPost
        ),
      },
      select: preferenceSelect,
    });

    return Response.json({
      success: true,
      message: "账户设置已保存",
      preferences,
    });
  } catch (error) {
    console.error("保存账户设置失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器保存账户设置失败",
      },
      {
        status: 500,
      }
    );
  }
}