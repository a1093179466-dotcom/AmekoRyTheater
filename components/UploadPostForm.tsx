"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardBackLink from "@/components/DashboardBackLink";


export default function UploadPostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  async function handleSubmit() {
    if (!title.trim()) {
      alert("标题不能为空");
      return;
    }

    if (!excerpt.trim()) {
      alert("简介不能为空");
      return;
    }

    if (!content.trim()) {
      alert("正文不能为空");
      return;
    }

    if (isNaN(Number(price))) {
      alert("价格必须是数字");
      return;
    }

    if (Number(price) < 0) {
      alert("价格不能小于 0");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("price", String(Number(price)));

    if (image) {
      formData.append("image", image);
    }

    const response = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "发布失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "发布失败");
      return;
    }

    alert("帖子发布成功");
    router.push(`/gallery/${result.post.id}`);
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink />
      
      <h1 className="text-4xl font-bold mb-8">
        发布新帖子
      </h1>

      <div className="flex flex-col gap-4 max-w-2xl">
        <input
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          placeholder="帖子标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 h-24"
          placeholder="首页展示简介"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <textarea
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 h-48"
          placeholder="帖子正文内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          placeholder="价格，例如 0 或 30"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
          <p className="mb-3 text-zinc-400">
            选择封面图
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImage(e.target.files[0]);
              }
            }}
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="封面预览"
              className="mt-4 w-full max-w-sm rounded-xl border border-zinc-700"
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
        >
          {loading ? "发布中..." : "发布帖子"}
        </button>
      </div>

      <section className="mt-10 bg-zinc-900 p-6 rounded-2xl max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">
          当前输入预览
        </h2>

        <p>标题：{title}</p>
        <p>简介：{excerpt}</p>
        <p>正文：{content}</p>
        <p>价格：{price}</p>
        <p>封面：{image ? image.name : "未选择图片"}</p>
      </section>
    </main>
  );
}