"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type EmailNotificationPreferences = {
  emailNotifyCommentReply: boolean;
  emailNotifyPurchase: boolean;
  emailNotifyNewPost: boolean;
};

type PreferenceKey = keyof EmailNotificationPreferences;

type EmailNotificationSettingsFormProps = {
  initialPreferences: EmailNotificationPreferences;
};

const preferenceItems: Array<{
  key: PreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "emailNotifyCommentReply",
    title: "评论回复邮件通知",
    description: "有人回复你的评论时发送邮件。",
  },
  {
    key: "emailNotifyPurchase",
    title: "购买相关邮件通知",
    description: "订单、支付和购买状态变化时发送邮件。",
  },
  {
    key: "emailNotifyNewPost",
    title: "新作品发布邮件通知",
    description: "站点发布新作品时发送邮件。",
  },
];

export default function EmailNotificationSettingsForm({
  initialPreferences,
}: EmailNotificationSettingsFormProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [savedPreferences, setSavedPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(() => {
    return preferenceItems.some(
      (item) => preferences[item.key] !== savedPreferences[item.key]
    );
  }, [preferences, savedPreferences]);

  function togglePreference(key: PreferenceKey) {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  async function handleSave() {
    if (saving || !hasChanges) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "账户设置保存失败", "error");
        return;
      }

      setPreferences(result.preferences);
      setSavedPreferences(result.preferences);
      toast(result.message || "账户设置已保存", "success");
      router.refresh();
    } catch {
      toast("账户设置保存失败，请稍后再试", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {preferenceItems.map((item) => {
        const enabled = preferences[item.key];

        return (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between gap-5 rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-rose-300/30 hover:bg-white/[0.05]"
          >
            <span>
              <span className="block text-lg font-bold text-white">
                {item.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-zinc-400">
                {item.description}
              </span>
            </span>

            <input
              type="checkbox"
              checked={enabled}
              onChange={() => togglePreference(item.key)}
              className="sr-only"
            />

            <span
              className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                enabled
                  ? "border-rose-300/60 bg-rose-400/80"
                  : "border-white/10 bg-white/10"
              }`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg transition ${
                  enabled ? "left-6" : "left-1"
                }`}
              />
            </span>
          </label>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-sm text-zinc-500">
          关闭后不会影响站内通知。
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
        >
          {saving ? "保存中..." : hasChanges ? "保存设置" : "已保存"}
        </button>
      </div>
    </div>
  );
}