import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { requireUserPage } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfileFavoritesPage() {
  const user = await requireUserPage();

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
      post: {
        type: "WORK",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  });

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
                Favorites
              </p>

              <h1 className="mb-4 text-5xl font-black tracking-tight">
                我的收藏
              </h1>

              <p className="max-w-2xl text-zinc-400">
                这里会显示你收藏过的作品。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-300/40 hover:bg-white/10 hover:text-white"
              >
                返回个人中心
              </Link>

              <Link
                href="/gallery"
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-rose-100"
              >
                继续浏览作品
              </Link>
            </div>
          </div>

          {favorites.length === 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/40">
              <p className="mb-3 text-2xl font-bold text-white">
                还没有收藏任何作品
              </p>

              <p className="mb-6 text-zinc-400">
                在作品详情页点击收藏后，它们会出现在这里。
              </p>

              <Link
                href="/gallery"
                className="inline-flex rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-rose-100"
              >
                去看作品
              </Link>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Collection
                  </p>

                  <h2 className="text-3xl font-bold">
                    收藏作品
                  </h2>
                </div>

                <p className="text-sm text-zinc-500">
                  共 {favorites.length} 个收藏
                </p>
              </div>

              <div className="flex flex-wrap gap-6">
                {favorites.map((favorite) => (
                  <PostCard
                    key={favorite.id}
                    id={favorite.post.id}
                    type={favorite.post.type}
                    title={favorite.post.title}
                    excerpt={favorite.post.excerpt}
                    author={favorite.post.author}
                    createdAt={formatDate(favorite.post.createdAt)}
                    price={favorite.post.price}
                    isPaid={favorite.post.isPaid}
                    isPinned={favorite.post.isPinned}
                    commentCount={favorite.post._count.comments}
                    coverImage={favorite.post.coverImage ?? undefined}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
