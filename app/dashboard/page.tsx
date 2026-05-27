import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";

export default async function DashboardPage() {
  // 只有管理员可以访问后台首页
  await requireAdminPage();
  
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        后台管理
      </h1>

      <Link
        href="/"
        className="inline-block mb-8 text-zinc-400 hover:text-white underline transition"
      >
       ← 返回网站首页
      </Link>
      
      <div className="grid gap-4 max-w-2xl">
        <Link
          href="/dashboard/upload"
          className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-800 transition"
        >
          <h2 className="text-2xl font-bold mb-2">
            发布新帖子
          </h2>

          <p className="text-zinc-400">
            上传封面图，填写标题、简介、正文和价格。
          </p>
        </Link>

        <Link
          href="/dashboard/posts"
          className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-800 transition"
        >
          <h2 className="text-2xl font-bold mb-2">
            管理帖子
          </h2>

          <p className="text-zinc-400">
            查看已经发布的帖子，后续会支持编辑、删除和评论管理。
          </p>
        </Link>
        <Link
          href="/dashboard/purchases"
          className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 hover:bg-zinc-800 transition"
        >
          <h2 className="text-2xl font-bold mb-2">
            购买记录
          </h2>

          <p className="text-zinc-400">
            查看用户购买了哪些作品，后续会支持退款、撤销权限和手动补发权限。
          </p>
        </Link>
      </div>
    </main>
  );
}