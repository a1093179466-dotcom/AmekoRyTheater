import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import EditPostForm from "@/components/EditPostForm";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireAdminPage();

  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="mb-6 text-zinc-400">内容 ID 不正确。</p>

          <Link
            href="/dashboard/posts"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
          >
            返回内容管理
          </Link>
        </div>
      </main>
    );
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="mb-6 text-zinc-400">没有找到这篇内容。</p>

          <Link
            href="/dashboard/posts"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
          >
            返回内容管理
          </Link>
        </div>
      </main>
    );
  }

  return <EditPostForm post={post} />;
}