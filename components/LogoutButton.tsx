"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/FeedbackProvider";

/**
 * 退出登录按钮。
 *
 * 这是客户端组件，因为它需要响应用户点击事件。
 */
export default function LogoutButton() {
  const router = useRouter();
  const { toast } = useFeedback();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.success) {
      toast(result.message || "退出登录失败", "error");
      return;
    }

    toast("已退出登录", "success");

    // 退出成功后刷新页面，让 Navbar 重新读取登录状态
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-zinc-300 hover:text-white transition disabled:text-zinc-600"
    >
      {loading ? "退出中..." : "退出登录"}
    </button>
  );
}
