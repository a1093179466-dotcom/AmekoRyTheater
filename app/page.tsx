import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 首页只显示已经发布的帖子。
  // 排序规则：
  // 1. 置顶帖子排前面
  // 2. 同样置顶状态下，越新的越靠前
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
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="flex flex-col items-center pt-24 px-6">
        <h1 className="text-6xl font-bold mb-6">
          AmekoRyTheater
        </h1>

        <p className="text-zinc-400 mb-12">
          欢迎来到我的个人创作剧场
        </p>

        {posts.length === 0 ? (
          <p className="text-zinc-500">
            目前还没有已发布内容。
          </p>
        ) : (
          <div className="flex gap-6 flex-wrap justify-center">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                type={post.type}
                title={post.title}
                excerpt={post.excerpt}
                author={post.author}
                createdAt={post.createdAt.toLocaleDateString()}
                price={post.price}
                isPaid={post.isPaid}
                isPinned={post.isPinned}
                commentCount={post._count.comments}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}