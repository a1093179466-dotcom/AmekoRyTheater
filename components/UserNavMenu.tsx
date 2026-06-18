"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFeedback } from "@/components/FeedbackProvider";
import UserAvatar from "@/components/UserAvatar";

type UserNavMenuProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  unreadNotificationCount: number;
};

function formatUnreadCount(count: number) {
  if (count > 99) {
    return "99+";
  }

  return String(count);
}

export default function UserNavMenu({
  user,
  unreadNotificationCount,
}: UserNavMenuProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "退出登录失败", "error");
        return;
      }

      toast("已退出登录", "success");
      router.push("/");
      router.refresh();
    } catch {
      toast("退出登录失败，请稍后再试", "error");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="relative rounded-full outline-none transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-rose-300/70"
        aria-label="打开用户菜单"
      >
        <UserAvatar avatarUrl={user.avatarUrl} name={user.name} size="sm" />

        {unreadNotificationCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full border border-black bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white shadow-lg shadow-rose-950/50">
            {formatUnreadCount(unreadNotificationCount)}
          </span>
        )}
      </button>

      <div className="invisible absolute right-0 top-full z-50 mt-3 w-64 translate-y-2 rounded-2xl border border-white/10 bg-black/90 p-3 text-sm opacity-0 shadow-2xl shadow-black/60 backdrop-blur-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="truncate font-medium text-white">
            {user.name}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {user.email}
          </p>
        </div>

        <Link
          href="/profile"
          className="block rounded-xl px-3 py-2 text-zinc-300 transition hover:bg-rose-500/10 hover:text-rose-100"
        >
          个人中心
        </Link>

        <Link
          href="/profile/notifications"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition hover:bg-rose-500/10 hover:text-rose-100"
        >
          <span>我的通知</span>
          {unreadNotificationCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {formatUnreadCount(unreadNotificationCount)}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-zinc-300 transition hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}
