"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";
import {
  feedbackStatuses,
  getFeedbackStatusClassName,
  type FeedbackStatus,
} from "@/lib/feedback";

type FeedbackStatusSelectProps = {
  feedbackId: number;
  initialStatus: FeedbackStatus;
};

export default function FeedbackStatusSelect({
  feedbackId,
  initialStatus,
}: FeedbackStatusSelectProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [status, setStatus] = useState<FeedbackStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(nextStatus: FeedbackStatus) {
    if (saving || nextStatus === status) {
      return;
    }

    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);

    try {
      const response = await fetch(`/api/feedbacks/${feedbackId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus(previousStatus);
        toast(result.message || "反馈状态更新失败", "error");
        return;
      }

      toast(result.message || "反馈状态已更新", "success");
      router.refresh();
    } catch {
      setStatus(previousStatus);
      toast("反馈状态更新失败，请稍后再试", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-xs text-zinc-500">
        处理状态
      </span>
      <select
        value={status}
        disabled={saving}
        onChange={(event) =>
          handleStatusChange(event.target.value as FeedbackStatus)
        }
        className={`w-full rounded-2xl border px-3 py-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${getFeedbackStatusClassName(
          status
        )}`}
      >
        {feedbackStatuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
