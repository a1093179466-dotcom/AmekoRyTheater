import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import { formatDate } from "@/lib/format";

import PostStatusBadges from "@/components/PostStatusBadges";
import DashboardPostActions from "@/components/DashboardPostActions";

export const dynamic = "force-dynamic";

/**
 * 后台内容管理页。
 *
 * 管理员可以在这里查看：
 * - 作品帖
 * - 公告帖
 * - 免费 / 付费
 * - 草稿 / 已发布
 * - 置顶状态
 *
 * 并进行查看、编辑、删除操作。
 */
export default async function DashboardPostsPage() {
  await requireAdminPage();

  const posts = await prisma.post.findMany({
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
          purchases: true,
          orders: true,
        },
      },
    },
  });

  const workCount = posts.filter((post) => post.type === "WORK").length;
  const noticeCount = posts.filter((post) => post.type === "NOTICE").length;
  const draftCount = posts.filter((post) => !post.isPublished).length;
  const paidCount = posts.filter((post) => post.isPaid).length;

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
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回后台
            </Link>

            <Link
              href="/dashboard/upload"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
            >
              发布新内容
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Content Management
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              内容管理
            </h1>

            <p className="max-w-2xl text-zinc-400">
              管理所有作品、公告和草稿内容。这里可以查看状态、进入编辑页面，或删除测试内容。
            </p>
          </div>

          <section className="mb-10 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">{posts.length}</p>
              <p className="mt-2 text-sm text-zinc-500">内容总数</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-rose-200">
                {workCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">作品帖</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-yellow-300">
                {noticeCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">公告帖</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-zinc-200">
                {draftCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">草稿</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Posts
                </p>

                <h2 className="text-3xl font-bold">
                  内容列表
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                付费内容 {paidCount} 篇
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                <p className="text-zinc-400">
                  目前还没有任何内容。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-rose-300/40 hover:bg-white/[0.05]"
                  >
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <div className="mb-3">
                          <PostStatusBadges
                            type={post.type}
                            isPaid={post.isPaid}
                            isPinned={post.isPinned}
                            isPublished={post.isPublished}
                            showPublishedStatus={true}
                            price={post.price}
                          />
                        </div>

                        <h3 className="mb-3 text-2xl font-bold">
                          {post.title}
                        </h3>

                        <p className="leading-7 text-zinc-400">
                          {post.excerpt}
                        </p>
                      </div>

                      <DashboardPostActions postId={post.id} />
                    </div>

                    <div className="grid gap-3 border-t border-white/10 pt-4 text-sm text-zinc-500 md:grid-cols-5">
                      <p>ID：{post.id}</p>
                      <p>发布时间：{formatDate(post.createdAt)}</p>
                      <p>评论：{post._count.comments}</p>
                      <p>订单：{post._count.orders}</p>
                      <p>购买权限：{post._count.purchases}</p>
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