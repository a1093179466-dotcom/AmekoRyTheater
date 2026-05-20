import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        后台管理
      </h1>

      <div className="flex flex-col gap-4 max-w-xl">
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
      </div>
    </main>
  );
}