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
  const [loading, setLoading] = useState(false);

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

      // 现在不再传 username
      // username 和 userId 都由后端根据 session 自动识别
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

      // 新评论刚发布，不需要精确显示时间，先显示“刚刚”
      createdAt: "刚刚",
    };

    setCommentList([
      ...commentList,
      newComment,
    ]);

    setCommentText("");
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