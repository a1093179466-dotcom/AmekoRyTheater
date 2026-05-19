"use client";

import { useState } from "react";

type Comment = {
  id: number;
  postId: number;
  username: string;
  content: string;
  createdAt: string;
};

type CommentSectionProps = {
  postId: number;
  comments: Comment[];
};

export default function CommentSection({
  postId,
  comments,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState(comments);
  const [loading, setLoading] = useState(false);

  async function handleAddComment() {
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
      body: JSON.stringify({
        postId,
        username: "当前用户",
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

    const newComment = {
      id: result.comment.id,
      postId: result.comment.postId,
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
        <textarea
          className="w-full bg-black border border-zinc-700 rounded-xl p-4"
          placeholder="登录后可以发表评论"
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
      </div>
    </section>
  );
}