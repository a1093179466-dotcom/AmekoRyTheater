import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NotificationList from "@/components/NotificationList";
import { requireUserPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfileNotificationsPage() {
  const user = await requireUserPage();

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
                Notifications
              </p>

              <h1 className="mb-4 text-5xl font-black tracking-tight">
                我的通知
              </h1>

              <p className="max-w-2xl text-zinc-400">
                这里会显示评论回复等站内通知。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-300/40 hover:bg-white/10 hover:text-white"
              >
                返回个人中心
              </Link>

              <span className="rounded-full border border-rose-300/20 bg-rose-950/20 px-5 py-2 text-sm text-rose-100">
                未读 {unreadCount}
              </span>
            </div>
          </div>

          <NotificationList
            notifications={notifications.map((notification) => ({
              id: notification.id,
              type: notification.type,
              title: notification.title,
              content: notification.content,
              linkUrl: notification.linkUrl,
              isRead: notification.isRead,
              createdAt: formatDateTime(notification.createdAt),
            }))}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
