"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type AuthDialogProps = {
  children: ReactNode;
};

/**
 * 登录 / 注册弹窗外壳。
 *
 * 用于 intercepting routes：
 * - 点击登录 / 注册时覆盖在当前页面上方
 * - 关闭时 router.back() 回到原页面
 */
export default function AuthDialog({ children }: AuthDialogProps) {
  const router = useRouter();

  function handleClose() {
    router.back();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <button
        className="absolute inset-0"
        onClick={handleClose}
        aria-label="关闭弹窗"
      />

      <section className="relative z-[101] w-full max-w-[400px] rounded-[28px] bg-[#090909] p-6 shadow-2xl shadow-black/80">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 transition"
          aria-label="关闭"
        >
          ×
        </button>

        {children}
      </section>
    </div>
  );
}