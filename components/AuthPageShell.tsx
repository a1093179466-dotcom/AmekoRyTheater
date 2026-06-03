"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/**
 * 登录 / 注册页面通用外壳。
 *
 * 作用：
 * - 统一账号页面背景风格
 * - 统一卡片布局
 * - 避免 login 和 register 页面重复写一大堆相同 UI
 */
export default function AuthPageShell({
  title,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-10 text-white">
      {/* 背景光晕：和首页、详情页保持同一种剧场感 */}
      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute right-10 top-36 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 md:grid-cols-[1fr_420px]">
          <section className="flex flex-col justify-center">
            <Link
              href="/"
              className="mb-10 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回首页
            </Link>

            <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              AmekoRyTheater
            </p>

            <h1 className="mb-6 text-5xl font-black tracking-tight md:text-6xl">
              Personal
              <span className="block bg-gradient-to-r from-rose-200 via-fuchsia-200 to-amber-100 bg-clip-text text-transparent">
                Creation Theater
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-zinc-400">
              登录后可以发表评论、购买作品，并在个人中心查看已购买内容和订单记录。
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="mb-3 text-3xl font-bold">
                {title}
              </h2>

              <p className="text-zinc-400">
                {subtitle}
              </p>
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}