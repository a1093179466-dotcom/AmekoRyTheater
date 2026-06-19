"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AuthPageShell from "@/components/AuthPageShell";
import { useFeedback } from "@/components/FeedbackProvider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useFeedback();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // 前端基础校验，避免空数据直接发给后端
    if (!email.trim()) {
      toast("邮箱不能为空", "error");
      return;
    }

    if (!password) {
      toast("密码不能为空", "error");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      toast(result.message || "登录失败", "error");
      return;
    }

    if (!result.success) {
      toast(result.message || "登录失败", "error");
      return;
    }

    // 登录成功后根据角色跳转。
    // 管理员进入后台，普通用户回首页。
    if (result.user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <AuthPageShell
      title="登录账号"
      subtitle="欢迎回来。登录后即可查看订单、购买记录和发表评论。"
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            密码
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="请输入密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-3 rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
        >
          {loading ? "登录中..." : "登录"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href="/register"
            className="text-zinc-400 hover:text-white underline transition"
          >
            没有账号？去注册
          </Link>

          <Link
            href="/forgot-password"
            className="text-zinc-400 hover:text-white underline transition"
          >
            忘记密码？
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
