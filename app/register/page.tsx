"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AuthPageShell from "@/components/AuthPageShell";
import { useFeedback } from "@/components/FeedbackProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useFeedback();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // 前端基础校验，提升用户体验。
    // 后端 API 仍然会再次校验，不能只依赖前端。
    if (!email.trim()) {
      toast("邮箱不能为空", "error");
      return;
    }

    if (!name.trim()) {
      toast("昵称不能为空", "error");
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

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        name,
        password,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      toast(result.message || "注册失败", "error");
      return;
    }

    if (!result.success) {
      toast(result.message || "注册失败", "error");
      return;
    }

    toast("注册成功，请登录账号", "success");

    setEmail("");
    setName("");
    setPassword("");
    setConfirmPassword("");

    router.push("/login");
  }

  return (
    <AuthPageShell
      title="创建账号"
      subtitle="注册后可以发表评论、购买作品，并在个人中心查看自己的订单。"
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
            昵称
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="用于评论区和个人中心显示"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            密码
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
            确认密码
          </span>

          <input
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
            placeholder="再次输入密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="mt-3 rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
        >
          {loading ? "注册中..." : "注册"}
        </button>

        <div className="mt-4 text-sm">
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white underline transition"
          >
            已有账号？去登录
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
