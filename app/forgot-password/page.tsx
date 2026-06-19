"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthPageShell from "@/components/AuthPageShell";
import { useFeedback } from "@/components/FeedbackProvider";

export default function ForgotPasswordPage() {
  const { toast } = useFeedback();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown]);

  async function handleSendCode() {
    if (loading || countdown > 0) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast("邮箱不能为空", "error");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      toast("邮箱格式不正确", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: "RESET_PASSWORD",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "发送验证码失败", "error");
        return;
      }

      toast(result.message || "如果邮箱存在，我们会发送验证码", "success");
      setSent(true);
      setCountdown(60);
    } catch {
      toast("发送验证码失败，请稍后再试", "error");
    } finally {
      setLoading(false);
    }
  }

  const resetHref = email.trim()
    ? `/reset-password?email=${encodeURIComponent(email.trim())}`
    : "/reset-password";

  return (
    <AuthPageShell
      title="找回密码"
      subtitle="输入注册邮箱，我们会发送用于重置密码的验证码。"
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            邮箱
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
          />
        </label>

        <button
          type="button"
          onClick={handleSendCode}
          disabled={loading || countdown > 0}
          className="mt-3 rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-rose-100 disabled:bg-zinc-500"
        >
          {loading
            ? "发送中..."
            : countdown > 0
              ? `${countdown} 秒后重发`
              : "发送验证码"}
        </button>

        {sent && (
          <Link
            href={resetHref}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            已收到验证码？去重置密码
          </Link>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href="/login"
            className="text-zinc-400 underline transition hover:text-white"
          >
            返回登录
          </Link>

          <Link
            href="/register"
            className="text-zinc-400 underline transition hover:text-white"
          >
            创建账号
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
