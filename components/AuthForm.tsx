"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

type AuthFormProps = {
  defaultMode: AuthMode;

  /**
   * 弹窗登录成功后执行。
   * 如果没有传，就按普通页面逻辑跳转。
   */
  onLoginSuccess?: (user: {
    role: string;
  }) => void;
};

export default function AuthForm({
  defaultMode,
  onLoginSuccess,
}: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [message, setMessage] = useState("");

  const isLogin = mode === "login";

  useEffect(() => {
    if (codeCountdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCodeCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [codeCountdown]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");

    if (nextMode === "login") {
      setEmailCode("");
      setCodeCountdown(0);
    }
  }

  async function handleSendEmailCode() {
    if (isLogin || sendingCode || codeCountdown > 0) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage("邮箱不能为空");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setMessage("邮箱格式不正确");
      return;
    }

    setMessage("");
    setSendingCode(true);

    try {
      const response = await fetch("/api/auth/send-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: "REGISTER",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "发送验证码失败");
        return;
      }

      setMessage(result.message || "验证码已发送，请查看邮箱");
      setCodeCountdown(60);
    } catch {
      setMessage("发送验证码失败，请稍后再试");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleLogin() {
    setMessage("");

    if (!email.trim()) {
      setMessage("邮箱不能为空");
      return;
    }

    if (!password) {
      setMessage("密码不能为空");
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

    if (!response.ok || !result.success) {
      setMessage(result.message || "登录失败");
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(result.user);
      return;
    }

    if (result.user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  async function handleRegister() {
    setMessage("");

    if (!email.trim()) {
      setMessage("邮箱不能为空");
      return;
    }

    if (!name.trim()) {
      setMessage("昵称不能为空");
      return;
    }

    if (password.length < 6) {
      setMessage("密码至少需要 6 位");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致");
      return;
    }

    if (!emailCode.trim()) {
      setMessage("邮箱验证码不能为空");
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
        emailCode,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.success) {
      setMessage(result.message || "注册失败");
      return;
    }

    setMessage("注册成功，请登录账号");

    setName("");
    setPassword("");
    setConfirmPassword("");
    setEmailCode("");
    setCodeCountdown(0);
    setMode("login");
  }

  return (
    <div>
      <div className="mb-6 pt-6 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-rose-300">
          AmekoRyTheater
        </p>

        <h2 className="mb-3 text-3xl font-black text-white">
          {isLogin ? "登录账号" : "创建账号"}
        </h2>

        <p className="text-sm leading-6 text-zinc-400">
          {isLogin
            ? "登录后可以购买作品、查看订单和发表评论。"
            : "注册后可以购买作品、发表评论，并管理自己的订单记录。"}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-full bg-white/5 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={
            isLogin
              ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
              : "rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-white"
          }
        >
          登录
        </button>

        <button
          type="button"
          onClick={() => switchMode("register")}
          className={
            !isLogin
              ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
              : "rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-white"
          }
        >
          注册
        </button>
      </div>

      <div className="flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            邮箱
          </span>

          <input
            className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {!isLogin && (
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">
              邮箱验证码
            </span>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="min-w-0 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="请输入 6 位验证码"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
              />

              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={sendingCode || codeCountdown > 0 || loading}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-500"
              >
                {sendingCode
                  ? "发送中..."
                  : codeCountdown > 0
                    ? `${codeCountdown} 秒后重发`
                    : "发送验证码"}
              </button>
            </div>
          </label>
        )}

        {!isLogin && (
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">
              昵称
            </span>

            <input
              className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
              placeholder="用于评论区显示"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">
            密码
          </span>

          <input
            className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
            placeholder={isLogin ? "请输入密码" : "至少 6 位"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {!isLogin && (
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">
              确认密码
            </span>

            <input
              className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
              placeholder="再次输入密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        )}

        {message && (
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-rose-100">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={isLogin ? handleLogin : handleRegister}
          disabled={loading}
          className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
        >
          {loading
            ? isLogin
              ? "登录中..."
              : "注册中..."
            : isLogin
              ? "登录"
              : "注册"}
        </button>
      </div>
    </div>
  );
}
