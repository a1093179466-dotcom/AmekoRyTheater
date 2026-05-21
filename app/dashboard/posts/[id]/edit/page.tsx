import Link from "next/link";
import DashboardBackLink from "@/components/DashboardBackLink";
import { prisma } from "@/lib/prisma";
import EditPostForm from "@/components/EditPostForm";
import { requireAdminPage } from "@/lib/auth";
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: PageProps) {
  // 只有管理员可以编辑帖子
  await requireAdminPage();

  const { id } = await params;

  // 后面保持原来的逻辑

  const postId = Number(id);

  // 校验 URL 参数，避免 /dashboard/posts/abc/edit 这种无效地址
  if (Number.isNaN(postId)) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子 ID 无效
        </h1>

        <Link
          href="/dashboard/posts"
          className="text-zinc-400 underline"
        >
          返回帖子管理
        </Link>
      </main>
    );
  }

  // 从数据库读取要编辑的帖子
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <Link
          href="/dashboard/posts"
          className="text-zinc-400 underline"
        >
          返回帖子管理
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink
        href="/dashboard/posts"
        label="← 返回帖子管理"
      />

      <h1 className="text-4xl font-bold mb-8">
        编辑帖子
      </h1>

      <EditPostForm
        post={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          price: post.price,
        }}
      />
    </main>
  );
}