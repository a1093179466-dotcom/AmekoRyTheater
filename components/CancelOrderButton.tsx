"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CancelOrderButtonProps = {
  orderId: number;
};

/**
 * 取消订单按钮
 *
 * 当前规则：
 * - 只能取消待支付订单
 * - 取消成功后刷新当前页面
 */
export default function CancelOrderButton({
  orderId,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "确定要取消这个订单吗？取消后需要重新下单。"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "取消订单失败");
      router.refresh();
      return;
    }

    if (!result.success) {
      alert(result.message || "取消订单失败");
      router.refresh();
      return;
    }

    alert(result.message || "订单已取消");

    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition disabled:bg-zinc-600"
    >
      {loading ? "取消中..." : "取消订单"}
    </button>
  );
}