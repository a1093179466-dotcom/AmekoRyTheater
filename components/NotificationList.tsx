"use client";

import { useState } from "react";
import Link from "next/link";

import { useFeedback } from "@/components/FeedbackProvider";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  content: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationListProps = {
  notifications: NotificationItem[];
};

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  const { toast } = useFeedback();
  const [items, setItems] = useState(notifications);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((item) => !item.isRead).length;

  async function markAsRead(notificationId: number) {
    setLoadingId(notificationId);

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "标记已读失败", "error");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
      toast("通知已标记为已读", "success");
    } catch {
      toast("标记已读失败，请稍后再试", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      toast("没有未读通知", "info");
      return;
    }

    setMarkingAll(true);

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "全部标记已读失败", "error");
        return;
      }

      setItems((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
      toast(`已标记 ${result.updatedCount ?? unreadCount} 条通知`, "success");
    } catch {
      toast("全部标记已读失败，请稍后再试", "error");
    } finally {
      setMarkingAll(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/40">
        <p className="mb-3 text-2xl font-bold text-white">
          暂无通知
        </p>

        <p className="text-zinc-400">
          当有人回复你的评论时，通知会出现在这里。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Inbox
          </p>

          <h2 className="text-3xl font-bold">
            通知列表
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-zinc-500">
            {unreadCount} 条未读
          </p>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-300/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? "处理中..." : "全部标记已读"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={
              item.isRead
                ? "rounded-3xl border border-white/10 bg-black/30 p-5"
                : "rounded-3xl border border-rose-300/30 bg-rose-500/10 p-5 shadow-lg shadow-rose-950/20"
            }
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className={
                      item.isRead
                        ? "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                        : "rounded-full border border-rose-300/30 bg-rose-950/30 px-3 py-1 text-xs text-rose-100"
                    }
                  >
                    {item.isRead ? "已读" : "未读"}
                  </span>

                  <span className="text-xs text-zinc-500">
                    {item.createdAt}
                  </span>
                </div>

                <Link
                  href={item.linkUrl}
                  className="text-xl font-bold text-white transition hover:text-rose-100"
                >
                  {item.title}
                </Link>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  disabled={loadingId === item.id}
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-500"
                >
                  {loadingId === item.id ? "处理中..." : "标记已读"}
                </button>
              )}
            </div>

            <p className="mb-4 whitespace-pre-wrap leading-7 text-zinc-300">
              {item.content}
            </p>

            <Link
              href={item.linkUrl}
              className="text-sm text-zinc-400 underline transition hover:text-white"
            >
              查看相关作品
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
