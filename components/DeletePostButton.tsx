"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeletePostButtonProps = {
  postId: number;
  title: string;
};

export default function DeletePostButton({
  postId,
  title,
}: DeletePostButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `确定要删除《${title}》吗？这个操作不能撤销。`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "删除失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "删除失败");
      return;
    }

    alert("删除成功");

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-900/60 px-4 py-2 rounded-xl hover:bg-red-800 transition disabled:bg-zinc-700"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}