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
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={loading}
      aria-label={liked ? "取消点赞" : "点赞"}
      title={liked ? "取消点赞" : "点赞"}
      className={
        liked
          ? "inline-flex h-9 items-center gap-2 rounded-full border border-amber-300/40 bg-amber-950/30 px-3 text-xs font-medium text-amber-100 transition hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-300 transition hover:border-amber-300/40 hover:bg-amber-950/20 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      <span aria-hidden="true" className="text-sm leading-none">
        👍
      </span>
      <span className="tabular-nums">
        {likeCount}
      </span>
      <span className="sr-only">
        {loading ? "处理中" : liked ? "已点赞" : "点赞"}
      </span>
    </button>
  );
}
