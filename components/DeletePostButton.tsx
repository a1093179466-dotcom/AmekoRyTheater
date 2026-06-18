"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/FeedbackProvider";

type DeletePostButtonProps = {
  postId: number;
  title: string;
};

export default function DeletePostButton({
  postId,
  title,
}: DeletePostButtonProps) {
  const router = useRouter();
  const { toast, confirm: showConfirm } = useFeedback();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = await showConfirm({
      title: "删除内容",
      message: `确定要删除《${title}》吗？这个操作不能撤销。`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });

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
      toast(result.message || "删除失败", "error");
      return;
    }

    if (!result.success) {
      toast(result.message || "删除失败", "error");
      return;
    }

    toast("删除成功", "success");

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
