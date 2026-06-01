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
 * 当前逻辑：
 * 1. 点击购买
 * 2. 创建 Order 订单
 * 3. 跳转到订单确认页 /orders/[id]
 *
 * 注意：
 * 这里不直接创建 Purchase。
 * Purchase 只会在订单支付成功后创建。
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

    const response = await fetch("/api/orders", {
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
      alert(result.message || "创建订单失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "创建订单失败");
      return;
    }

    router.push(`/orders/${result.order.id}`);
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition disabled:bg-zinc-500"
    >
      {loading ? "创建订单中..." : `购买作品 ¥${price}`}
    </button>
  );
}