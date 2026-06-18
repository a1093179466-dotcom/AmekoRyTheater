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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">收藏</p>
          <p className="mt-1 text-xs text-zinc-500">
            {favoriteCount} 人收藏
          </p>
        </div>

        <span className="rounded-full border border-rose-300/20 bg-rose-950/20 px-3 py-1 text-xs text-rose-100">
          Favorite
        </span>
      </div>

      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={loading}
        className={
          favorited
            ? "w-full rounded-full border border-rose-300/40 bg-rose-950/30 px-5 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            : "w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-500"
        }
      >
        {loading ? "处理中..." : favorited ? "已收藏，点击取消" : "收藏作品"}
      </button>
    </div>
  );
}
