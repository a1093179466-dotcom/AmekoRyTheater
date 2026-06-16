"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type AvatarUploadProps = {
  avatarUrl?: string | null;
  userName?: string | null;
};

export default function AvatarUpload({
  avatarUrl,
  userName,
}: AvatarUploadProps) {
  const router = useRouter();
  const { toast } = useFeedback();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl || "");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("请选择图片文件", "error");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast("头像图片不能超过 3MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setUploading(false);

    if (!response.ok || !result.success) {
      toast(result.message || "头像上传失败", "error");
      return;
    }

    setCurrentAvatarUrl(result.avatarUrl);
    toast("头像已更新", "success");
    router.refresh();
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
      <div className="mb-6">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
          Avatar
        </p>

        <h2 className="text-3xl font-bold">
          个人头像
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="用户头像"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-black text-zinc-500">
              {(userName || "U").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <p className="mb-4 text-sm leading-6 text-zinc-400">
            上传后会显示在个人中心。后续会接到评论区，让评论看起来更像正式社区。
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
          >
            {uploading ? "上传中..." : "上传头像"}
          </button>
        </div>
      </div>
    </section>
  );
}