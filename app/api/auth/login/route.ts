import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // 1. 基础校验：邮箱不能为空
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "邮箱不能为空",
        },
        {
          status: 400,
        }
      );
    }

    // 2. 基础校验：密码不能为空
    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "密码不能为空",
        },
        {
          status: 400,
        }
      );
    }

    // 3. 根据邮箱查找用户
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // 不要提示“邮箱不存在”或“密码错误”得太具体。
    // 统一提示账号或密码错误，更安全。
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "邮箱或密码错误",
        },
        {
          status: 401,
        }
      );
    }

    // 4. 验证用户输入的密码是否匹配数据库里的 passwordHash
    const isPasswordCorrect = verifyPassword(
      password,
      user.passwordHash
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "邮箱或密码错误",
        },
        {
          status: 401,
        }
      );
    }

    // 5. 生成随机 session token。
    // 这个 token 会保存到 Cookie 里，用来代表“当前已登录用户”。
    const token = randomBytes(32).toString("hex");

    // 6. 设置会话有效期：这里先设为 7 天。
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 7. 把 session 保存到数据库。
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // 8. 创建响应结果。
    // 注意：不要把 passwordHash 返回给前端。
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // 9. 把 session token 写入浏览器 Cookie。
    // httpOnly 表示前端 JS 不能直接读取这个 Cookie，更安全。
    response.cookies.set("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("登录失败：", error);

    return NextResponse.json(
      {
        success: false,
        message: "服务器登录失败",
      },
      {
        status: 500,
      }
    );
  }
}