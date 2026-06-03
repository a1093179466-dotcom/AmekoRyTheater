import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * 作品列表页
 *
 * 路径：
 * /gallery
 *
 * 只展示：
 * - 已发布内容
 * - 类型为 WORK 的作品帖
 *
 * 不展示：
 * - 公告帖
 * - 草稿
 */
export default async function GalleryPage() {
  const posts = await prisma.post.findMany({
    where: {
      isPublished: true,
      type: "WORK",
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

  const paidPosts = posts.filter((post) => post.isPaid);
  const freePosts = posts.filter((post) => !post.isPaid);

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
              Gallery
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              作品列表
            </h1>

            <p className="max-w-2xl text-zinc-400">
              这里展示所有已经发布的作品。免费作品可以直接阅读，付费作品购买后可以永久解锁隐藏内容。
            </p>
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">
                {posts.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                全部作品
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-rose-200">
                {paidPosts.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                付费作品
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-green-300">
                {freePosts.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                免费作品
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-zinc-400">
                目前还没有已发布作品。
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  type={post.type}
                  title={post.title}
                  excerpt={post.excerpt}
                  author={post.author}
                  createdAt={formatDate(post.createdAt)}
                  price={post.price}
                  isPaid={post.isPaid}
                  isPinned={post.isPinned}
                  commentCount={post._count.comments}
                  coverImage={post.coverImage}
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