import Link from "next/link";

import FeedbackStatusSelect from "@/components/FeedbackStatusSelect";
import { requireAdminPage } from "@/lib/auth";
import {
  type FeedbackStatus,
  getFeedbackStatusClassName,
  getFeedbackStatusLabel,
  getFeedbackTypeLabel,
} from "@/lib/feedback";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusCount(feedbacks: Array<{ status: string }>, status: string) {
  return feedbacks.filter((feedback) => feedback.status === status).length;
}

export default async function DashboardFeedbacksPage() {
  await requireAdminPage();

  const feedbacks = await prisma.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  const openCount = getStatusCount(feedbacks, "OPEN");
  const inProgressCount = getStatusCount(feedbacks, "IN_PROGRESS");
  const resolvedCount = getStatusCount(feedbacks, "RESOLVED");
  const closedCount = getStatusCount(feedbacks, "CLOSED");

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ← 返回后台
            </Link>

            <Link
              href="/feedback"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              打开前台反馈页
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Feedback Management
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              反馈管理
            </h1>

            <p className="max-w-2xl text-zinc-400">
              查看游客和登录用户提交的问题反馈、功能建议、购买问题，并跟进处理状态。
            </p>
          </div>

          <section className="mb-10 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">{feedbacks.length}</p>
              <p className="mt-2 text-sm text-zinc-500">反馈总数</p>
            </div>

            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6">
              <p className="text-3xl font-bold text-rose-100">{openCount}</p>
              <p className="mt-2 text-sm text-zinc-500">待处理</p>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
              <p className="text-3xl font-bold text-yellow-100">
                {inProgressCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">处理中</p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <p className="text-3xl font-bold text-emerald-100">
                {resolvedCount + closedCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">已结束</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Feedbacks
                </p>

                <h2 className="text-3xl font-bold">
                  反馈列表
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                按提交时间倒序
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                <p className="text-zinc-400">
                  目前还没有用户反馈。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {feedbacks.map((feedback) => (
                  <article
                    key={feedback.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                            {getFeedbackTypeLabel(feedback.type)}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${getFeedbackStatusClassName(
                              feedback.status
                            )}`}
                          >
                            {getFeedbackStatusLabel(feedback.status)}
                          </span>

                          <span className="text-xs text-zinc-600">
                            #{feedback.id}
                          </span>
                        </div>

                        <h3 className="mb-3 text-2xl font-bold text-white">
                          {feedback.title}
                        </h3>

                        <div className="grid gap-2 text-sm text-zinc-500 md:grid-cols-2">
                          <p>
                            提交时间：{formatDateTime(feedback.createdAt)}
                          </p>
                          <p>
                            更新时间：{formatDateTime(feedback.updatedAt)}
                          </p>
                          <p className="break-all">
                            联系邮箱：{feedback.email || "未填写"}
                          </p>
                          <p>
                            提交账号：
                            {feedback.user
                              ? `${feedback.user.name}（${feedback.user.email}）`
                              : "游客"}
                          </p>
                        </div>

                        <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <summary className="cursor-pointer text-sm font-medium text-rose-100">
                            查看详情
                          </summary>
                          <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-zinc-300">
                            {feedback.content}
                          </p>
                        </details>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <FeedbackStatusSelect
                          feedbackId={feedback.id}
                          initialStatus={feedback.status as FeedbackStatus}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
