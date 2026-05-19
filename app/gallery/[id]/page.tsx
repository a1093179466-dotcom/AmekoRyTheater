import Image from "next/image";

import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <p className="text-zinc-400">
          无效的帖子 ID：{id}
        </p>
      </main>
    );
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <p className="text-zinc-400">
          没有找到 ID 为 {id} 的帖子。
        </p>
      </main>
    );
  }

  const postComments = post.comments.map((comment) => ({
    id: comment.id,
    postId: comment.postId,
    username: comment.username,
    content: comment.content,
    createdAt: comment.createdAt.toLocaleString(),
  }));

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <Image
        src={post.coverImage}
        alt={post.title}
        width={800}
        height={500}
        className="rounded-2xl mb-8"
      />

      <h1 className="text-4xl font-bold mb-4">
        {post.title}
      </h1>

      <p className="text-zinc-500 mb-6">
        作者：{post.author} · 发布于{" "}
        {post.createdAt.toLocaleDateString()}
      </p>

      <p className="text-zinc-300 leading-8 mb-8">
        {post.content}
      </p>

      <div className="bg-zinc-900 p-6 rounded-2xl">
        {post.isPaid ? (
          <p>这是付费作品，价格：¥{post.price}</p>
        ) : (
          <p>这是免费作品。</p>
        )}
      </div>

      <CommentSection
        postId={post.id}
        comments={postComments}
      />
    </main>
  );
}