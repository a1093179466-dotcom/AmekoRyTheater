import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  // 作品页只显示：
  // 1. 已发布
  // 2. 类型是 WORK 的作品帖
  //
  // 公告帖以后可以单独做 /notices 页面。
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

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">
          作品列表
        </h1>

        <p className="text-zinc-400 mb-10">
          这里展示所有已经发布的作品帖。
        </p>

        {posts.length === 0 ? (
          <p className="text-zinc-500">
            目前还没有已发布作品。
          </p>
        ) : (
          <div className="flex gap-6 flex-wrap">
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