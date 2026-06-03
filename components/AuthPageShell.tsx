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
 * 设计目标：
 * - 居中小窗
 * - 不做大面积左右分栏
 * - 保留暗色剧场背景
 * - 更接近轻量账号弹窗的感觉
 */
export default function AuthPageShell({
  title,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-10 text-white">
      <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute right-10 top-36 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center">
        <Link
          href="/"
          className="mb-8 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
        >
          ← 返回首页
        </Link>

        <section className="w-full max-w-md rounded-[2rem] bg-white/[0.04] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-rose-300">
              AmekoRyTheater
            </p>

            <h1 className="mb-3 text-3xl font-black">
              {title}
            </h1>

            <p className="text-sm leading-6 text-zinc-400">
              {subtitle}
            </p>
          </div>

          {children}
        </section>

        <p className="mt-8 text-center text-xs text-zinc-600">
          登录后可以购买作品、查看订单、发表评论和管理个人内容。
        </p>
      </div>
    </main>
  );
}