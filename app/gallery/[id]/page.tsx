import Image from "next/image";
import { posts } from "@/data/posts";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const post = posts.find((item) => item.id === Number(id));

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">帖子不存在</h1>
        <p className="text-zinc-400">没有找到 ID 为 {id} 的帖子。</p>
      </main>
    );
  }

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
        作者：{post.author} · 发布于 {post.createdAt}
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
      <section className="mt-10 bg-zinc-900 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">评论区</h2>

      <div className="flex flex-col gap-4">
        <div className="border-b border-zinc-700 pb-4">
          <p className="font-bold">测试用户A</p>
          <p className="text-zinc-400 mt-1">
            这个作品很喜欢，期待后续更新。
          </p>
        </div>

        <div className="border-b border-zinc-700 pb-4">
          <p className="font-bold">测试用户B</p>
          <p className="text-zinc-400 mt-1">
            已购买，内容质量不错。
          </p>
        </div>
      </div>

      <div className="mt-8">
        <textarea
          className="w-full bg-black border border-zinc-700 rounded-xl p-4"
          placeholder="登录后可以发表评论"
          rows={4}
        />

        <button className="mt-4 bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition">
          发表评论
        </button>
      </div>
    </section>
    </main>
  );
}