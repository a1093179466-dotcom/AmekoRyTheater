"use client";

import { useState } from "react";
import Link from "next/link";

import UserAvatar from "@/components/UserAvatar";
import { useFeedback } from "@/components/FeedbackProvider";

type Comment = {
  id: number;
  postId: number;
  userId: number | null;
  username: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
};

type CurrentUser = {
  id: number;
  name: string | null;
  role: string;
  avatarUrl?: string | null;
} | null;

type CommentSectionProps = {
  postId: number;
  comments: Comment[];
  currentUser: CurrentUser;
};

export default function CommentSection({
  postId,
  comments,
  currentUser,
}: CommentSectionProps) {
  const { toast, confirm: showConfirm } = useFeedback();

  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState(comments);

  const [loading, setLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  async function handleAddComment() {
    if (!currentUser) {
      toast("请先登录后再发表评论", "error");
      return;
    }

    if (!commentText.trim()) {
      toast("评论不能为空", "error");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        content: commentText,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.success) {
      toast(result.message || "评论发布失败", "error");
      return;
    }

    const newComment: Comment = {
      id: result.comment.id,
      postId: result.comment.postId,
      userId: result.comment.userId,
      username:
        result.comment.username || currentUser.name || "匿名用户",
      avatarUrl: currentUser.avatarUrl || null,
      content: result.comment.content,
      createdAt: "刚刚",
    };

    setCommentList([...commentList, newComment]);
    setCommentText("");

    toast("评论已发布", "success");
  }

  async function handleDeleteComment(comment: Comment) {
    if (!currentUser) {
      toast("请先登录", "error");
      return;
    }

    const confirmed = await showConfirm({
      title: "删除评论",
      message: `确定要删除 ${comment.username} 的这条评论吗？`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(comment.id);

    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    setDeletingCommentId(null);

    if (!response.ok || !result.success) {
      toast(result.message || "删除评论失败", "error");
      return;
    }

    setCommentList(commentList.filter((item) => item.id !== comment.id));

    toast("评论已删除", "success");
  }

  function canDeleteComment(comment: Comment) {
    if (!currentUser) {
      return false;
    }

    if (currentUser.role === "ADMIN") {
      return true;
    }

    return comment.userId === currentUser.id;
  }

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Comments
          </p>

          <h2 className="text-2xl font-bold">
            评论区
          </h2>
        </div>

        <p className="text-sm text-zinc-500">
          {commentList.length} 条评论
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {commentList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-zinc-400">
              还没有评论。
            </p>
          </div>
        ) : (
          commentList.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-4">
                <UserAvatar
                  avatarUrl={comment.avatarUrl}
                  name={comment.username}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <p className="font-bold text-white">
                      {comment.username}
                    </p>

                    <p className="text-xs text-zinc-600">
                      {comment.createdAt}
                    </p>
                  </div>

                  <p className="whitespace-pre-wrap leading-7 text-zinc-300">
                    {comment.content}
                  </p>
                </div>

                {canDeleteComment(comment) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment)}
                    disabled={deletingCommentId === comment.id}
                    className="shrink-0 rounded-full border border-red-800 bg-red-900/20 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900/40 disabled:opacity-60"
                  >
                    {deletingCommentId === comment.id
                      ? "删除中..."
                      : "删除"}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8">
        {currentUser ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-3">
              <UserAvatar
                avatarUrl={currentUser.avatarUrl}
                name={currentUser.name}
                size="sm"
              />

              <p className="text-sm text-zinc-500">
                当前以{" "}
                <span className="text-zinc-200">
                  {currentUser.name || "未命名用户"}
                </span>{" "}
                的身份发表评论
              </p>
            </div>

            <textarea
              className="h-28 w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
              placeholder="写下你的评论"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAddComment}
              disabled={loading}
              className="mt-4 rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-rose-100 disabled:bg-zinc-500"
            >
              {loading ? "发表中..." : "发表评论"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-4 text-zinc-400">
              登录后可以发表评论。
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-white px-5 py-2 font-medium text-black transition hover:bg-rose-100"
              >
                去登录
              </Link>

              <Link
                href="/register"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 font-medium text-white transition hover:bg-white/10"
              >
                注册账号
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}