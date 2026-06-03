import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * 公告列表页
 *
 * 路径：
 * /notices
 *
 * 只展示：
 * - 已发布内容
 * - 类型为 NOTICE 的公告帖
 */
export default async function NoticesPage() {
  const notices = await prisma.post.findMany({
    where: {
      isPublished: true,
      type: "NOTICE",
    },
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  const pinnedNotices = notices.filter((notice) => notice.isPinned);
  const normalNotices = notices.filter((notice) => !notice.isPinned);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Notices
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              公告通知
            </h1>

            <p className="max-w-2xl text-zinc-400">
              这里展示网站公告、更新说明、购买须知和其他重要通知。
            </p>
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">
                {notices.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                全部公告
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-yellow-300">
                {pinnedNotices.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                置顶公告
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-zinc-200">
                {normalNotices.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                普通公告
              </p>
            </div>
          </div>

          {notices.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-zinc-400">
                目前还没有公告。
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {notices.map((notice) => (
                <PostCard
                  key={notice.id}
                  id={notice.id}
                  type={notice.type}
                  title={notice.title}
                  excerpt={notice.excerpt}
                  author={notice.author}
                  createdAt={formatDate(notice.createdAt)}
                  price={notice.price}
                  isPaid={notice.isPaid}
                  isPinned={notice.isPinned}
                  commentCount={notice._count.comments}
                  coverImage={notice.coverImage}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}