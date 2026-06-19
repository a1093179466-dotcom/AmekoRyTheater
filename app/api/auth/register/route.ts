import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { verifyEmailCode } from "@/lib/emailCode";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const emailCode = String(body.emailCode || body.code || "").trim();

    // 1. 基础校验：邮箱不能为空
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

    // 2. 简单邮箱格式校验
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

    // 3. 昵称不能为空
    if (!name) {
      return Response.json(
        {
          success: false,
          message: "昵称不能为空",
        },
        {
          status: 400,
        }
      );
    }

    // 4. 密码长度校验
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

    // 5. 注册必须先通过邮箱验证码。
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

    // 6. 检查邮箱是否已经注册
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "这个邮箱已经注册过了",
        },
        {
          status: 409,
        }
      );
    }

    const verificationResult = await verifyEmailCode({
      email,
      purpose: "REGISTER",
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

    // 7. 密码不能明文保存，必须先哈希
    const passwordHash = hashPassword(password);

    // 8. 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("注册失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器注册失败",
      },
      {
        status: 500,
      }
    );
  }
}
