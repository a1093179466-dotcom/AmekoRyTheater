"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useFeedback } from "@/components/FeedbackProvider";

type ResetPasswordFormProps = {
  showHeader?: boolean;
};

export default function ResetPasswordForm({
  showHeader = false,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const { toast } = useFeedback();

  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("email") || "";
  });
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      toast("邮箱不能为空", "error");
      return;
    }

    if (!emailCode.trim()) {
      toast("邮箱验证码不能为空", "error");
      return;
    }

    if (password.length < 6) {
      toast("密码至少需要 6 位", "error");
      return;
    }

    if (password !== confirmPassword) {
      toast("两次输入的密码不一致", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          emailCode,
          password,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "重置密码失败", "error");
        return;
      }

      toast(result.message || "密码已重置，请登录", "success");
      setPassword("");
      setConfirmPassword("");
      setEmailCode("");
      router.push("/login");
    } catch {
      toast("重置密码失败，请稍后再试", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {showHeader && (
        <div className="mb-6 pt-6 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-rose-300">
            AmekoRyTheater
          </p>

          <h2 className="mb-3 text-3xl font-black text-white">
            重置密码
          </h2>

          <p className="text-sm leading-6 text-zinc-400">
            填写邮箱验证码和新密码，完成后即可用新密码登录。
          </p>
        </div>
      )}

      <div className="flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            邮箱
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            邮箱验证码
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="请输入 6 位验证码"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            新密码
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="至少 6 位"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            确认新密码
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="再次输入新密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="mt-3 rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-rose-100 disabled:bg-zinc-500"
        >
          {loading ? "重置中..." : "重置密码"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-zinc-400 underline transition hover:text-white"
          >
            重新发送验证码
          </Link>

          <Link
            href="/login"
            className="text-zinc-400 underline transition hover:text-white"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}
