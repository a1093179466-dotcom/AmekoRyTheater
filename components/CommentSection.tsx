"use client";

import { useState } from "react";
import Link from "next/link";

type Comment = {
  id: number;
  postId: number;
  userId: number | null;
  username: string;
  content: string;
  createdAt: string;
};

type CurrentUser = {
  id: number;
  name: string;
  role: string;
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
  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState(comments);

  // 发布评论时的 loading
  const [loading, setLoading] = useState(false);

  // 当前正在删除的评论 ID
  // 用它可以让某一条评论的按钮显示“删除中...”
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  async function handleAddComment() {
    // 前端先判断一次，避免未登录时还发请求
    if (!currentUser) {
      alert("请先登录后再发表评论");
      return;
    }

    if (!commentText.trim()) {
      alert("评论不能为空");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      // 不传 username，也不传 userId。
      // 后端会根据 session 自动识别当前用户。
      body: JSON.stringify({
        postId,
        content: commentText,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "评论发布失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "评论发布失败");
      return;
    }

    const newComment: Comment = {
      id: result.comment.id,
      postId: result.comment.postId,
      userId: result.comment.userId,
      username: result.comment.username,
      content: result.comment.content,
      createdAt: "刚刚",
    };

    setCommentList([
      ...commentList,
      newComment,
    ]);

    setCommentText("");
  }

  async function handleDeleteComment(comment: Comment) {
    if (!currentUser) {
      alert("请先登录");
      return;
    }

    const confirmed = window.confirm(
      `确定要删除 ${comment.username} 的这条评论吗？`
    );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(comment.id);

    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    setDeletingCommentId(null);

    if (!response.ok) {
      alert(result.message || "删除评论失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "删除评论失败");
      return;
    }

    // 删除成功后，把这条评论从前端列表里移除
    setCommentList(
      commentList.filter((item) => item.id !== comment.id)
    );
  }

  function canDeleteComment(comment: Comment) {
    if (!currentUser) {
      return false;
    }

    // 管理员可以删除所有评论
    if (currentUser.role === "ADMIN") {
      return true;
    }

    // 普通用户只能删除自己的评论
    return comment.userId === currentUser.id;
  }

  return (
    <section className="mt-10 bg-zinc-900 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">
        评论区
      </h2>

      <div className="flex flex-col gap-4">
        {commentList.length === 0 ? (
          <p className="text-zinc-400">
            还没有评论。
          </p>
        ) : (
          commentList.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-zinc-700 pb-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {comment.username}
                  </p>

                  <p className="text-zinc-400 mt-1">
                    {comment.content}
                  </p>

                  <p className="text-xs text-zinc-600 mt-2">
                    {comment.createdAt}
                  </p>
                </div>

                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteComment(comment)}
                    disabled={deletingCommentId === comment.id}
                    className="text-sm text-red-400 hover:text-red-300 transition disabled:text-zinc-600"
                  >
                    {deletingCommentId === comment.id
                      ? "删除中..."
                      : "删除"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        {currentUser ? (
          <>
            <p className="text-sm text-zinc-500 mb-3">
              当前以 {currentUser.name} 的身份发表评论
            </p>

            <textarea
              className="w-full bg-black border border-zinc-700 rounded-xl p-4"
              placeholder="写下你的评论"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <button
              onClick={handleAddComment}
              disabled={loading}
              className="mt-4 bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition disabled:bg-zinc-500"
            >
              {loading ? "发表中..." : "发表评论"}
            </button>
          </>
        ) : (
          <div className="bg-black border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-400 mb-4">
              登录后可以发表评论。
            </p>

            <div className="flex gap-3">
              <Link
                href="/login"
                className="bg-white text-black px-5 py-2 rounded-xl hover:bg-zinc-300 transition"
              >
                去登录
              </Link>

              <Link
                href="/register"
                className="bg-zinc-800 px-5 py-2 rounded-xl hover:bg-zinc-700 transition"
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