"use client";

import { useState } from "react";
import Link from "next/link";

import UserAvatar from "@/components/UserAvatar";
import { useFeedback } from "@/components/FeedbackProvider";

type Comment = {
  id: number;
  postId: number;
  parentId: number | null;
  userId: number | null;
  username: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
  replies: Comment[];
};

type CurrentUser = {
  id: number;
  name: string | null;
  role: string;
  avatarUrl?: string | null;
} | null;

type ApiComment = {
  id: number;
  postId: number;
  parentId: number | null;
  userId: number | null;
  username?: string | null;
  content: string;
  user?: {
    name?: string | null;
    avatarUrl?: string | null;
  } | null;
};

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
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyTextById, setReplyTextById] = useState<Record<number, string>>(
    {}
  );

  const [loading, setLoading] = useState(false);
  const [replyLoadingId, setReplyLoadingId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  const totalCommentCount = commentList.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0
  );

  function buildLocalComment(apiComment: ApiComment): Comment {
    return {
      id: apiComment.id,
      postId: apiComment.postId,
      parentId: apiComment.parentId ?? null,
      userId: apiComment.userId,
      username:
        apiComment.user?.name ||
        apiComment.username ||
        currentUser?.name ||
        "匿名用户",
      avatarUrl:
        apiComment.user?.avatarUrl ?? currentUser?.avatarUrl ?? null,
      content: apiComment.content,
      createdAt: "刚刚",
      replies: [],
    };
  }

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

    try {
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

      if (!response.ok || !result.success) {
        toast(result.message || "评论发布失败", "error");
        return;
      }

      setCommentList((current) => [
        ...current,
        buildLocalComment(result.comment),
      ]);
      setCommentText("");

      toast("评论已发布", "success");
    } catch {
      toast("评论发布失败，请稍后再试", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleStartReply(comment: Comment) {
    if (!currentUser) {
      toast("请先登录后再回复", "error");
      return;
    }

    setReplyingToId((current) => (current === comment.id ? null : comment.id));
  }

  async function handleAddReply(targetComment: Comment, rootComment: Comment) {
    if (!currentUser) {
      toast("请先登录后再回复", "error");
      return;
    }

    const replyText = (replyTextById[targetComment.id] || "").trim();

    if (!replyText) {
      toast("回复内容不能为空", "error");
      return;
    }

    setReplyLoadingId(targetComment.id);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          parentId: targetComment.id,
          content: replyText,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "回复发布失败", "error");
        return;
      }

      const newReply = buildLocalComment(result.comment);
      const rootId = newReply.parentId ?? rootComment.id;

      setCommentList((current) =>
        current.map((comment) =>
          comment.id === rootId
            ? {
                ...comment,
                replies: [...comment.replies, newReply],
              }
            : comment
        )
      );

      setReplyTextById((current) => ({
        ...current,
        [targetComment.id]: "",
      }));
      setReplyingToId(null);

      toast("回复已发布", "success");
    } catch {
      toast("回复发布失败，请稍后再试", "error");
    } finally {
      setReplyLoadingId(null);
    }
  }

  async function handleDeleteComment(
    comment: Comment,
    rootComment?: Comment
  ) {
    if (!currentUser) {
      toast("请先登录", "error");
      return;
    }

    const confirmed = await showConfirm({
      title: comment.parentId ? "删除回复" : "删除评论",
      message: `确定要删除 ${comment.username} 的这条${
        comment.parentId ? "回复" : "评论"
      }吗？`,
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(comment.id);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast(result.message || "删除评论失败", "error");
        return;
      }

      if (rootComment) {
        setCommentList((current) =>
          current.map((item) =>
            item.id === rootComment.id
              ? {
                  ...item,
                  replies: item.replies.filter(
                    (reply) => reply.id !== comment.id
                  ),
                }
              : item
          )
        );
      } else {
        setCommentList((current) =>
          current.filter((item) => item.id !== comment.id)
        );
      }

      toast(comment.parentId ? "回复已删除" : "评论已删除", "success");
    } catch {
      toast("删除评论失败，请稍后再试", "error");
    } finally {
      setDeletingCommentId(null);
    }
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

  function renderReplyForm(targetComment: Comment, rootComment: Comment) {
    if (replyingToId !== targetComment.id) {
      return null;
    }

    return (
      <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-950/10 p-4">
        <textarea
          className="h-24 w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
          placeholder={`回复 ${targetComment.username}`}
          value={replyTextById[targetComment.id] || ""}
          onChange={(event) =>
            setReplyTextById((current) => ({
              ...current,
              [targetComment.id]: event.target.value,
            }))
          }
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAddReply(targetComment, rootComment)}
            disabled={replyLoadingId === targetComment.id}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-rose-100 disabled:bg-zinc-500"
          >
            {replyLoadingId === targetComment.id ? "回复中..." : "发布回复"}
          </button>

          <button
            type="button"
            onClick={() => setReplyingToId(null)}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  function renderCommentActions(comment: Comment, rootComment?: Comment) {
    return (
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleStartReply(comment)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          回复
        </button>

        {canDeleteComment(comment) && (
          <button
            type="button"
            onClick={() => handleDeleteComment(comment, rootComment)}
            disabled={deletingCommentId === comment.id}
            className="rounded-full border border-red-800 bg-red-900/20 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900/40 disabled:opacity-60"
          >
            {deletingCommentId === comment.id ? "删除中..." : "删除"}
          </button>
        )}
      </div>
    );
  }

  function renderReply(reply: Comment, rootComment: Comment) {
    return (
      <div
        key={reply.id}
        className="border-b border-white/10 py-4 last:border-b-0"
      >
        <div className="flex items-start gap-3">
          <UserAvatar
            avatarUrl={reply.avatarUrl}
            name={reply.username}
            size="sm"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <p className="font-bold text-white">
                {reply.username}
              </p>

              <p className="text-xs text-zinc-600">
                {reply.createdAt}
              </p>
            </div>

            <p className="whitespace-pre-wrap leading-7 text-zinc-300">
              {reply.content}
            </p>

            {renderCommentActions(reply, rootComment)}
            {renderReplyForm(reply, rootComment)}
          </div>
        </div>
      </div>
    );
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
          {totalCommentCount} 条评论
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

                  {renderCommentActions(comment)}
                  {renderReplyForm(comment, comment)}

                  {comment.replies.length > 0 && (
                    <div className="mt-5 border-l border-white/10 pl-4">
                      {comment.replies.map((reply) =>
                        renderReply(reply, comment)
                      )}
                    </div>
                  )}
                </div>
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
              onChange={(event) => setCommentText(event.target.value)}
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
