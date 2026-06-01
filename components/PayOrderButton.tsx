"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PayOrderButtonProps = {
  orderId: number;
  postId: number;
  amount: number;
};

/**
 * 模拟支付按钮
 *
 * 当前阶段：
 * - 点击后调用 /api/orders/[id]/pay
 * - 后端会把订单改为 PAID
 * - 后端会创建 Purchase 权限
 *
 * 以后接真实支付：
 * - 这个按钮会替换成真实支付入口
 */
export default function PayOrderButton({
  orderId,
  postId,
  amount,
}: PayOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    const confirmed = window.confirm(
      `模拟支付 ¥${amount}？`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/orders/${orderId}/pay`, {
      method: "POST",
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "支付失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "支付失败");
      return;
    }

    alert(result.message || "支付成功");

    // 支付成功后跳转回作品详情页。
    // 此时详情页会重新读取 Purchase，并显示隐藏内容。
    router.push(`/gallery/${postId}`);
    router.refresh();
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition disabled:bg-zinc-500"
    >
      {loading ? "支付中..." : `模拟支付 ¥${amount}`}
    </button>
  );
}