"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type PayOrderButtonProps = {
  orderId: number;
  postId: number;
  amount: number;

  // 订单过期时间，服务端传入 ISO 字符串。
  expiresAt?: string | null;
};

/**
 * 模拟支付按钮。
 *
 * 前端倒计时只负责展示体验，真正是否允许支付仍由后端 API 判断。
 */
export default function PayOrderButton({
  orderId,
  postId,
  amount,
  expiresAt,
}: PayOrderButtonProps) {
  const router = useRouter();
  const { toast, confirm: showConfirm } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const expireTime = useMemo(() => {
    if (!expiresAt) {
      return null;
    }

    const value = new Date(expiresAt).getTime();

    return Number.isNaN(value) ? null : value;
  }, [expiresAt]);

  useEffect(() => {
    if (expireTime === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [expireTime]);

  const secondsLeft =
    expireTime === null ? null : Math.max(0, Math.ceil((expireTime - now) / 1000));

  const isExpired = secondsLeft !== null && secondsLeft <= 0;

  async function handlePay() {
    if (isExpired) {
      toast("订单已超时，请重新下单", "error");
      return;
    }

    const confirmed = await showConfirm({
      title: "确认支付",
      message:
        "确定要模拟支付这个订单吗？支付成功后将解锁对应作品。",
      confirmText: "确认支付",
      cancelText: "取消",
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "支付失败", "error");
        router.refresh();
        return;
      }

      toast(result.message || "支付成功", "success");

      router.push(`/gallery/${postId}`);
      router.refresh();
    } catch {
      toast("支付失败，请稍后再试", "error");
      router.refresh();
    } finally {
      setLoading(false);
    }
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
