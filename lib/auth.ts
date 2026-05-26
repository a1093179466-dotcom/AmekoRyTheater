import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * 读取当前登录用户。
 *
 * 工作流程：
 * 1. 从浏览器 Cookie 里读取 session_token
 * 2. 用 session_token 去数据库查 Session
 * 3. 如果 Session 有效，就返回对应的 User
 * 4. 如果没登录、Session 不存在、Session 过期，就返回 null
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  // 没有 session_token，说明当前用户没有登录
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },

    // 顺便把这个 Session 对应的用户查出来
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  // 数据库里找不到这个 Session，说明 Cookie 无效
  if (!session) {
    return null;
  }

  // 如果 Session 已经过期，也视为未登录
  if (session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

/**
 * 页面级管理员权限检查。
 *
 * 用在 dashboard 页面里。
 *
 * 逻辑：
 * 1. 没登录：跳转到登录页
 * 2. 已登录但不是管理员：跳转到首页
 * 3. 是管理员：返回当前用户
 */
export async function requireAdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
/**
 * 页面级登录权限检查。
 *
 * 用在需要登录才能访问的页面里，比如：
 * - 个人中心
 * - 购买记录
 * - 用户设置
 *
 * 逻辑：
 * 1. 没登录：跳转到登录页
 * 2. 已登录：返回当前用户
 */
export async function requireUserPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
/**
 * API 级管理员权限检查。
 *
 * 用在 route.ts 里。
 * API 不能用 redirect，而应该返回 JSON 错误。
 */
export async function isCurrentUserAdmin() {
  const user = await getCurrentUser();

  return Boolean(user && user.role === "ADMIN");
}