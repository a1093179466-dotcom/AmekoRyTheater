import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * 公告列表页
 *
 * 路径：
 * /notices
 *
 * 作用：
 * 只展示已经发布的公告帖。
 *
 * 和 /gallery 的区别：
 * - /gallery 只展示作品帖 WORK
 * - /notices 只展示公告帖 NOTICE
 */
export default async function NoticesPage() {
  const notices = await prisma.post.findMany({
    where: {
      isPublished: true,
      type: "NOTICE",
    },

    // 公告也支持置顶。
    // 置顶公告排前面，同样置顶状态下按发布时间倒序。
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
          公告通知
        </h1>

        <p className="text-zinc-400 mb-10">
          这里展示网站公告、更新说明、购买须知和其他通知内容。
        </p>

        {notices.length === 0 ? (
          <p className="text-zinc-500">
            目前还没有公告。
          </p>
        ) : (
          <div className="flex gap-6 flex-wrap">
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
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}