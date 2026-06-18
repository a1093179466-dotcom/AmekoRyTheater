"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type FavoriteButtonProps = {
  postId: number;
  initialFavorited: boolean;
  initialFavoriteCount: number;
  isLoggedIn: boolean;
};

export default function FavoriteButton({
  postId,
  initialFavorited,
  initialFavoriteCount,
  isLoggedIn,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [loading, setLoading] = useState(false);

  async function handleToggleFavorite() {
    if (!isLoggedIn) {
      toast("请先登录后再收藏作品", "error");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/favorites", {
      method: favorited ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.success) {
      toast(result.message || "收藏操作失败", "error");
      return;
    }

    const nextFavorited = Boolean(result.favorited);
    const nextFavoriteCount =
      typeof result.favoriteCount === "number"
        ? result.favoriteCount
        : favoriteCount;

    setFavorited(nextFavorited);
    setFavoriteCount(nextFavoriteCount);
    toast(result.message || (nextFavorited ? "作品已收藏" : "已取消收藏"), "success");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={loading}
      aria-label={favorited ? "取消收藏" : "收藏"}
      title={favorited ? "取消收藏" : "收藏"}
      className={
        favorited
          ? "inline-flex h-9 items-center gap-2 rounded-full border border-rose-300/40 bg-rose-950/30 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-900/40 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-300 transition hover:border-rose-300/40 hover:bg-rose-950/20 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {favorited ? "★" : "☆"}
      </span>
      <span className="tabular-nums">
        {favoriteCount}
      </span>
      <span className="sr-only">
        {loading ? "处理中" : favorited ? "已收藏" : "收藏"}
      </span>
    </button>
  );
}
