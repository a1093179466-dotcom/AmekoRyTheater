"use client";

import { FormEvent, useState } from "react";

import { useFeedback } from "@/components/FeedbackProvider";
import { feedbackTypes, type FeedbackType } from "@/lib/feedback";

type FeedbackFormProps = {
  initialEmail?: string;
  isLoggedIn: boolean;
};

export default function FeedbackForm({
  initialEmail = "",
  isLoggedIn,
}: FeedbackFormProps) {
  const { toast } = useFeedback();
  const [type, setType] = useState<FeedbackType>("BUG");
  const [email, setEmail] = useState(initialEmail);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle) {
      toast("反馈标题不能为空", "error");
      return;
    }

    if (!nextContent) {
      toast("反馈内容不能为空", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          email: email.trim(),
          title: nextTitle,
          content: nextContent,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "反馈提交失败", "error");
        return;
      }

      toast(result.message || "反馈已提交", "success");
      setType("BUG");
      setEmail(initialEmail);
      setTitle("");
      setContent("");
    } catch {
      toast("反馈提交失败，请稍后再试", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 md:p-8"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            类型
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as FeedbackType)}
            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-rose-300/60"
          >
            {feedbackTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            联系邮箱
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={isLoggedIn ? "可使用当前账号邮箱" : "可选"}
            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            标题
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="简单概括一下"
            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            内容
          </span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={3000}
            rows={8}
            placeholder="请写下你遇到的情况、建议，或购买相关问题"
            className="min-h-44 w-full resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-300/60"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {isLoggedIn ? "已关联当前账号" : "游客反馈不会自动关联账号"}
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
        >
          {submitting ? "提交中..." : "提交反馈"}
        </button>
      </div>
    </form>
  );
}
