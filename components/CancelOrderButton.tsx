"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/FeedbackProvider";
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
  const { toast, confirm: showConfirm } = useFeedback();
  async function handleCancel() {
    const confirmed = await showConfirm({
      title: "取消订单",
      message: "确定要取消这个订单吗？取消后如需购买，需要重新创建订单。",
      confirmText: "取消订单",
      cancelText: "再想想",
      danger: true,
    });

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
      toast(result.message || "取消订单失败", "error");
      router.refresh();
      return;
    }

    if (!result.success) {
      alert(result.message || "取消订单失败");
      router.refresh();
      return;
    }

    toast(result.message || "订单已取消", "success");

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