import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

/**
 * 网站顶部导航栏。
 *
 * 这是服务端组件：
 * - 可以直接读取 Cookie
 * - 可以查询数据库
 * - 可以判断当前用户是否登录
 */
export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="w-full bg-zinc-900 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        AmekoRyTheater
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/" className="text-zinc-300 hover:text-white transition">
          首页
        </Link>

        <Link
          href="/gallery"
          className="text-zinc-300 hover:text-white transition"
        >
          作品
        </Link>

        <Link
          href="/about"
          className="text-zinc-300 hover:text-white transition"
        >
          关于
        </Link>

        {user ? (
          <>
            {/* 登录后显示用户昵称 */}
            <span className="text-zinc-400">
              {user.name}
              {user.role === "ADMIN" ? " · 管理员" : ""}
            </span>
            <Link
              href="/profile"
              className="text-zinc-300 hover:text-white transition"
            >
              个人中心
            </Link>
            {/* 管理员才显示后台入口 */}
            {user.role === "ADMIN" && (
              <Link
                href="/dashboard"
                className="text-zinc-300 hover:text-white transition"
              >
                后台
              </Link>
            )}

            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-zinc-300 hover:text-white transition"
            >
              登录
            </Link>

            <Link
              href="/register"
              className="bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-300 transition"
            >
              注册
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}