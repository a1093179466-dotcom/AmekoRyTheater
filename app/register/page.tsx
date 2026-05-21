"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim()) {
      alert("邮箱不能为空");
      return;
    }

    if (!name.trim()) {
      alert("昵称不能为空");
      return;
    }

    if (password.length < 6) {
      alert("密码至少需要 6 位");
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
      alert(result.message || "注册失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "注册失败");
      return;
    }

    alert("注册成功，下一步我们会开发登录功能");

    setEmail("");
    setName("");
    setPassword("");
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
        注册账号
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
          placeholder="昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          placeholder="密码，至少 6 位"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
        >
          {loading ? "注册中..." : "注册"}
        </button>

        <Link
          href="/login"
          className="text-zinc-400 hover:text-white underline transition"
        >
          已有账号？去登录
        </Link>
      </div>
    </main>
  );
}