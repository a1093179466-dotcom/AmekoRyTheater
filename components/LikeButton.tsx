"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type LikeButtonProps = {
  postId: number;
  initialLiked: boolean;
  initialLikeCount: number;
  isLoggedIn: boolean;
};

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  isLoggedIn,
}: LikeButtonProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  async function handleToggleLike() {
    if (!isLoggedIn) {
      toast("请先登录后再点赞", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/likes", {
        method: liked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "点赞操作失败", "error");
        return;
      }

      const nextLiked = Boolean(result.liked);
      const nextLikeCount =
        typeof result.likeCount === "number" ? result.likeCount : likeCount;

      setLiked(nextLiked);
      setLikeCount(nextLikeCount);
      toast(result.message || (nextLiked ? "作品已点赞" : "已取消点赞"), "success");
      router.refresh();
    } catch {
      toast("点赞操作失败，请稍后再试", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">
            点赞
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {likeCount} 人点赞
          </p>
        </div>

        <span className="rounded-full border border-amber-300/20 bg-amber-950/20 px-3 py-1 text-xs text-amber-100">
          Like
        </span>
      </div>

      <button
        type="button"
        onClick={handleToggleLike}
        disabled={loading}
        className={
          liked
            ? "w-full rounded-full border border-amber-300/40 bg-amber-950/30 px-5 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            : "w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-zinc-500"
        }
      >
        {loading ? "处理中..." : liked ? "已点赞，点击取消" : "点赞作品"}
      </button>
    </div>
  );
}
