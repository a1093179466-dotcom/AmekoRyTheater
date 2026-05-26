"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PurchaseButtonProps = {
  postId: number;
  price: number;
};

/**
 * 购买按钮
 *
 * 当前阶段是模拟购买：
 * 点击后直接调用 /api/purchases，创建买断权限。
 */
export default function PurchaseButton({
  postId,
  price,
}: PurchaseButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    const confirmed = window.confirm(
      `确定购买这个作品吗？价格：¥${price}`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        postId,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "购买失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "购买失败");
      return;
    }

    alert(result.message || "购买成功");

    // 刷新当前页面，让服务端重新判断是否已购买
    router.refresh();
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition disabled:bg-zinc-500"
    >
      {loading ? "购买中..." : `购买作品 ¥${price}`}
    </button>
  );
}