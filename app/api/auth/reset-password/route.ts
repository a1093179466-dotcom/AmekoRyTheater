import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { verifyEmailCode } from "@/lib/emailCode";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const emailCode = String(body.emailCode || body.code || "").trim();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "邮箱不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        {
          success: false,
          message: "邮箱格式不正确",
        },
        {
          status: 400,
        }
      );
    }

    if (!emailCode) {
      return Response.json(
        {
          success: false,
          message: "邮箱验证码不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "密码至少需要 6 位",
        },
        {
          status: 400,
        }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        {
          success: false,
          message: "两次输入的密码不一致",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "验证码无效",
          reason: "NOT_FOUND",
        },
        {
          status: 400,
        }
      );
    }

    const verificationResult = await verifyEmailCode({
      email,
      purpose: "RESET_PASSWORD",
      code: emailCode,
    });

    if (!verificationResult.success) {
      return Response.json(
        {
          success: false,
          message: verificationResult.message,
          reason: verificationResult.reason,
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash = hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
        },
      }),
      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return Response.json({
      success: true,
      message: "密码已重置，请使用新密码登录",
    });
  } catch (error) {
    console.error("重置密码失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器重置密码失败",
      },
      {
        status: 500,
      }
    );
  }
}
