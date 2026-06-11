"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/FeedbackProvider";
type PayOrderButtonProps = {
  orderId: number;
  postId: number;
  amount: number;

  // 订单过期时间，服务端传入 ISO 字符串
  expiresAt?: string | null;
};

/**
 * 模拟支付按钮
 *
 * 当前阶段：
 * - 显示订单剩余支付时间
 * - 超时后禁用按钮
 * - 点击后调用 /api/orders/[id]/pay
 *
 * 注意：
 * 前端倒计时只是用户体验。
 * 真正是否允许支付，仍然由后端 API 判断。
 */
export default function PayOrderButton({
  orderId,
  postId,
  amount,
  expiresAt,
}: PayOrderButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const { toast, confirm: showConfirm } = useFeedback();
  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null);
      return;
    }

    function updateCountdown() {
      const expireTime = new Date(expiresAt as string).getTime();
      const now = Date.now();

      const nextSecondsLeft = Math.max(
        0,
        Math.ceil((expireTime - now) / 1000)
      );

      setSecondsLeft(nextSecondsLeft);
    }

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [expiresAt]);

  const isExpired = secondsLeft !== null && secondsLeft <= 0;

  async function handlePay() {
    if (isExpired) {
      toast("订单已超时，请重新下单", "error");
      return;
    }

    const confirmed = await showConfirm({
      title: "确认支付",
      message: "确定要模拟支付这个订单吗？支付成功后将解锁对应作品。",
      confirmText: "确认支付",
      cancelText: "取消",
    });

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
      toast(result.message || "支付失败", "error");
      router.refresh();
      return;
    }

    if (!result.success) {
      toast(result.message || "支付失败", "error");
      router.refresh();
      return;
    }

    toast(result.message || "支付成功", "success");

    router.push(`/gallery/${postId}`);
    router.refresh();
  }

  let buttonText = `模拟支付 ¥${amount}`;

  if (loading) {
    buttonText = "支付中...";
  } else if (isExpired) {
    buttonText = "订单已超时";
  } else if (secondsLeft !== null) {
    buttonText = `模拟支付 ¥${amount}（剩余 ${secondsLeft} 秒）`;
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading || isExpired}
      className="bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition disabled:bg-zinc-500"
    >
      {buttonText}
    </button>
  );
}