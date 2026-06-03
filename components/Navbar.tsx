import Link from "next/link";
import AuthNavButtons from "@/components/AuthNavButtons";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

/**
 * 网站顶部导航栏。
 *
 * 当前设计方向：
 * - 深色半透明背景
 * - 顶部吸附
 * - 轻微玻璃质感
 * - 登录后显示用户身份
 */
export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-400 via-fuchsia-500 to-amber-300 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white">
              A
            </div>
          </div>

          <div>
            <p className="text-lg font-bold tracking-wide text-white group-hover:text-rose-200 transition">
              AmekoRyTheater
            </p>
            <p className="text-xs text-zinc-500">
              Personal Creation Theater
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-5 text-sm">
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
            href="/notices"
            className="text-zinc-300 hover:text-white transition"
          >
            公告
          </Link>

          <Link
            href="/about"
            className="text-zinc-300 hover:text-white transition"
          >
            关于
          </Link>

          {user ? (
            <>
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300 md:inline">
                {user.name}
                {user.role === "ADMIN" ? " · 管理员" : ""}
              </span>

              <Link
                href="/profile"
                className="text-zinc-300 hover:text-white transition"
              >
                个人中心
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-rose-100 transition"
                >
                  后台
                </Link>
              )}

              <LogoutButton />
            </>
          ) : (
            <>
              <AuthNavButtons />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}