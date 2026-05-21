import Image from "next/image";
import Link from "next/link";
import DeletePostButton from "@/components/DeletePostButton";
import { prisma } from "@/lib/prisma";
import DashboardBackLink from "@/components/DashboardBackLink";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPostsPage() {
  // 只有管理员可以进入帖子管理页
  await requireAdminPage();

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          帖子管理
        </h1>

        <Link
          href="/dashboard/upload"
          className="bg-white text-black px-5 py-3 rounded-xl hover:bg-zinc-300 transition"
        >
          发布新帖子
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-400">
          目前还没有帖子。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-5"
            >
              <Image
                src={post.coverImage}
                alt={post.title}
                width={160}
                height={100}
                className="rounded-xl object-cover"
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {post.title}
                </h2>

                <p className="text-zinc-400 mb-3">
                  {post.excerpt}
                </p>

                <div className="text-sm text-zinc-500 flex gap-4 mb-4">
                  <span>
                    ID：{post.id}
                  </span>

                  <span>
                    评论：{post._count.comments}
                  </span>

                  <span>
                    {post.isPaid ? `付费 ¥${post.price}` : "免费"}
                  </span>

                  <span>
                    {post.createdAt.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/gallery/${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                  >
                    查看
                  </Link>

                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                    >
                    编辑
                  </Link>

                  <DeletePostButton
                    postId={post.id}
                    title={post.title}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}