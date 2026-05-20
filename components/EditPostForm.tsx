"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EditPostFormProps = {
  post: {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    price: number;
  };
};

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  // 表单初始值来自数据库里的旧帖子数据
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [price, setPrice] = useState(String(post.price));

  // image 表示用户新选择的封面文件
  const [image, setImage] = useState<File | null>(null);

  // previewUrl 用来显示新封面的本地预览
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果没有选择新图片，就不生成本地预览
    if (!image) {
      setPreviewUrl("");
      return;
    }

    // 为本地图片生成临时浏览器预览地址
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    // 组件卸载或图片变化时，释放临时地址，避免内存泄漏
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  async function handleSubmit() {
    // 提交前的基础校验
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

    // 使用 FormData，因为编辑帖子时可能同时上传新封面
    const formData = new FormData();

    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("price", String(Number(price)));

    if (image) {
      formData.append("image", image);
    }

    const response = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      body: formData,
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.message || "编辑失败");
      return;
    }

    if (!result.success) {
      alert(result.message || "编辑失败");
      return;
    }

    alert("帖子编辑成功");

    // 编辑成功后跳转回帖子详情页
    router.push(`/gallery/${post.id}`);
    router.refresh();
  }

  return (
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
          当前封面
        </p>

        <img
          src={post.coverImage}
          alt="当前封面"
          className="w-full max-w-sm rounded-xl border border-zinc-700 mb-4"
        />

        <p className="mb-3 text-zinc-400">
          选择新封面，不选择则保留当前封面
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
            alt="新封面预览"
            className="mt-4 w-full max-w-sm rounded-xl border border-zinc-700"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
      >
        {loading ? "保存中..." : "保存修改"}
      </button>
    </div>
  );
}