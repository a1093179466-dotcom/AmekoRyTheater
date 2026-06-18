import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import SiteTicker from "@/components/SiteTicker";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { getSiteSetting } from "@/lib/siteSetting";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [setting, currentUser] = await Promise.all([
    getSiteSetting(),
    getCurrentUser(),
  ]);

  // 首页只展示已发布内容。
  // 置顶优先，其次按发布时间倒序。
  const posts = await prisma.post.findMany({
    where: {
      isPublished: true,
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
          favorites: true,
          likes: true,
        },
      },
      favorites: {
        where: {
          userId: currentUser?.id ?? -1,
        },
        select: {
          id: true,
        },
      },
      likes: {
        where: {
          userId: currentUser?.id ?? -1,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);
  const homeBackgroundImage = setting.homeBackgroundImage.trim();
  const homeHeroImage = setting.homeHeroImage.trim();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <SiteTicker />

      <section className="relative overflow-hidden px-6 py-24">
        {homeBackgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{
                backgroundImage: `url(${JSON.stringify(homeBackgroundImage)})`,
              }}
            />
            <div className="absolute inset-0 bg-black/75" />
          </>
        )}

        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-32 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
                {setting.siteSubtitle || "Personal Creation Theater"}
              </p>

              <h1 className="mb-6 max-w-4xl text-6xl font-black tracking-tight md:text-7xl">
                <span className="bg-gradient-to-r from-rose-100 via-fuchsia-100 to-amber-100 bg-clip-text text-transparent">
                  {setting.homeHeroTitle || "AmekoRyTheater"}
                </span>
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-zinc-400">
                {setting.homeHeroSubtitle ||
                  "一个用于发布个人作品、公告通知与付费内容的创作者剧场。在这里可以浏览免费内容，也可以购买单篇作品解锁隐藏内容。"}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/gallery"
                  className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition"
                >
                  浏览作品
                </Link>

                <Link
                  href="/notices"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white hover:bg-white/10 transition"
                >
                  查看公告
                </Link>
              </div>
            </div>

            {homeHeroImage && (
              <div className="relative min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 md:min-h-[340px]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${JSON.stringify(homeHeroImage)})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5" />
              </div>
            )}
          </div>

          {featuredPost && (
            <section className="mb-20 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/50 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Featured
                  </p>

                  <h2 className="text-3xl font-bold">
                    推荐内容
                  </h2>
                </div>

                <Link
                  href={`/gallery/${featuredPost.id}`}
                  className="hidden rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition md:block"
                >
                  查看详情
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 md:justify-start">
                <PostCard
                  id={featuredPost.id}
                  type={featuredPost.type}
                  title={featuredPost.title}
                  excerpt={featuredPost.excerpt}
                  author={featuredPost.author}
                  createdAt={formatDate(featuredPost.createdAt)}
                  price={featuredPost.price}
                  isPaid={featuredPost.isPaid}
                  isPinned={featuredPost.isPinned}
                  commentCount={featuredPost._count.comments}
                  likeCount={featuredPost._count.likes}
                  favoriteCount={featuredPost._count.favorites}
                  isLiked={featuredPost.likes.length > 0}
                  isFavorited={featuredPost.favorites.length > 0}
                  isLoggedIn={Boolean(currentUser)}
                  coverImage={featuredPost.coverImage}
                />
              </div>
            </section>
          )}

          <section>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-zinc-500">
                  Latest
                </p>

                <h2 className="text-3xl font-bold">
                  最新发布
                </h2>
              </div>

              <Link
                href="/gallery"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                查看全部作品 →
              </Link>
            </div>

            {otherPosts.length === 0 ? (
              <p className="text-zinc-500">
                目前还没有更多已发布内容。
              </p>
            ) : (
              <div className="flex flex-wrap gap-6">
                {otherPosts.map((post) => (
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
                    likeCount={post._count.likes}
                    favoriteCount={post._count.favorites}
                    isLiked={post.likes.length > 0}
                    isFavorited={post.favorites.length > 0}
                    isLoggedIn={Boolean(currentUser)}
                    coverImage={post.coverImage}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
