import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * 退出登录接口。
 *
 * 它会做两件事：
 * 1. 删除数据库里的 Session
 * 2. 删除浏览器里的 session_token Cookie
 */
export async function POST() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    // 删除数据库里的 Session。
    // deleteMany 比 delete 更安全，因为 token 不存在时不会报错。
    await prisma.session.deleteMany({
      where: {
        token: sessionToken,
      },
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "退出登录成功",
  });

  // 清除浏览器 Cookie
  response.cookies.set("session_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}