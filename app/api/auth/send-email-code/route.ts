import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  createEmailVerificationCode,
  isEmailCodePurpose,
} from "@/lib/emailCode";

export const runtime = "nodejs";

const RESET_PASSWORD_MESSAGE =
  "如果邮箱存在，我们会发送验证码，请稍后查看邮箱";

function buildEmailContent({
  code,
  purpose,
}: {
  code: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}) {
  if (purpose === "REGISTER") {
    return {
      subject: "注册验证码",
      text: `你的注册验证码是：${code}。验证码 10 分钟内有效，请勿泄露给他人。`,
      html: `<p>你的注册验证码是：<strong>${code}</strong></p><p>验证码 10 分钟内有效，请勿泄露给他人。</p>`,
    };
  }

  return {
    subject: "找回密码验证码",
    text: `你的找回密码验证码是：${code}。验证码 10 分钟内有效，请勿泄露给他人。`,
    html: `<p>你的找回密码验证码是：<strong>${code}</strong></p><p>验证码 10 分钟内有效，请勿泄露给他人。</p>`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const purpose = String(body.purpose || "").trim().toUpperCase();

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

    if (!isEmailCodePurpose(purpose)) {
      return Response.json(
        {
          success: false,
          message: "验证码用途无效",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (purpose === "REGISTER" && existingUser) {
      return Response.json(
        {
          success: false,
          message: "这个邮箱已经注册过了，可以直接登录",
        },
        {
          status: 409,
        }
      );
    }

    if (purpose === "RESET_PASSWORD" && !existingUser) {
      return Response.json({
        success: true,
        message: RESET_PASSWORD_MESSAGE,
      });
    }

    const verificationCode = await createEmailVerificationCode({
      email,
      purpose,
    });

    const emailContent = buildEmailContent({
      code: verificationCode.code,
      purpose,
    });

    await sendEmail({
      to: email,
      ...emailContent,
    });

    if (purpose === "RESET_PASSWORD") {
      return Response.json({
        success: true,
        message: RESET_PASSWORD_MESSAGE,
      });
    }

    return Response.json({
      success: true,
      message: "验证码已发送，请查看邮箱",
    });
  } catch (error) {
    console.error("发送邮箱验证码失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器发送验证码失败",
      },
      {
        status: 500,
      }
    );
  }
}
