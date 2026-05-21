"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // 1. 前端基础校验，避免空数据直接发给后端
    if (!email.trim()) {
      alert("邮箱不能为空");
      return;
    }

    if (!password) {
      alert("密码不能为空");
      return;
    }

    setLoading(true);

    // 2. 请求登录 API
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
      alert(result.message || "登录失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "登录失败");
      return;
    }

    alert("登录成功");

    // 3. 登录成功后，根据角色跳转。
    // 目前普通用户回首页，管理员进后台。
    if (result.user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white underline transition"
        >
          ← 返回首页
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">
        登录账号
      </h1>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          placeholder="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
        >
          {loading ? "登录中..." : "登录"}
        </button>

        <Link
          href="/register"
          className="text-zinc-400 hover:text-white underline transition"
        >
          没有账号？去注册
        </Link>
      </div>
    </main>
  );
}