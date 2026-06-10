"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type DashboardPostActionsProps = {
  postId: number;
};

/**
 * 后台内容列表操作按钮。
 *
 * 包含：
 * - 查看
 * - 编辑
 * - 删除
 */
export default function DashboardPostActions({
  postId,
}: DashboardPostActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "确定要删除这篇内容吗？删除后无法恢复。"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    setDeleting(false);

    if (!response.ok || !result.success) {
      alert(result.message || "删除失败");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/gallery/${postId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
      >
        查看
      </Link>

      <Link
        href={`/dashboard/posts/${postId}/edit`}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
      >
        编辑
      </Link>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-full border border-red-800 bg-red-900/30 px-4 py-2 text-sm text-red-200 hover:bg-red-900/50 transition disabled:opacity-60"
      >
        {deleting ? "删除中..." : "删除"}
      </button>
    </div>
  );
}