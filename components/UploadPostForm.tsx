"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardBackLink from "@/components/DashboardBackLink";

/**
 * 后台发布帖子表单。
 *
 * 这是客户端组件，因为它需要：
 * - useState 管理输入框内容
 * - useEffect 生成封面图本地预览
 * - onClick 响应发布按钮
 */
export default function UploadPostForm() {
  const router = useRouter();

  // 帖子基础信息
  const [type, setType] = useState("WORK");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // 作品内容信息
  const [previewContent, setPreviewContent] = useState("");
  const [paidContent, setPaidContent] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadCode, setDownloadCode] = useState("");

  // 售卖信息
  const [price, setPrice] = useState("");

  // 发布控制
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  // 封面图
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 没有选择图片时，不显示本地预览
    if (!image) {
      setPreviewUrl("");
      return;
    }

    // 为本地文件生成临时预览地址
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    // 图片变更或组件卸载时释放临时地址，避免内存泄漏
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  async function handleSubmit() {
    // 标题、简介、正文是所有帖子都必须有的内容
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

    // 公告帖不需要价格。
    // 如果选择公告帖，价格会在后端被强制处理为 0。
    if (type === "NOTICE" && Number(price) > 0) {
      alert("公告帖不能设置价格");
      return;
    }

    setLoading(true);

    // 使用 FormData，因为这里可能会上传封面图。
    const formData = new FormData();

    formData.append("type", type);
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("previewContent", previewContent);
    formData.append("paidContent", paidContent);
    formData.append("downloadUrl", downloadUrl);
    formData.append("downloadCode", downloadCode);
    formData.append("price", String(Number(price)));
    formData.append("isPublished", String(isPublished));
    formData.append("isPinned", String(isPinned));

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

    // 发布成功后跳转到新帖子的详情页
    router.push(`/gallery/${result.post.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink />

      <h1 className="text-4xl font-bold mb-8">
        发布新帖子
      </h1>

      <div className="flex flex-col gap-6 max-w-3xl">
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            基础信息
          </h2>

          <div className="flex flex-col gap-4">
            <select
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="WORK">作品帖</option>
              <option value="NOTICE">公告帖</option>
            </select>

            <input
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              placeholder="帖子标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 h-24"
              placeholder="首页展示简介"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <textarea
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 h-40"
              placeholder="正文介绍内容，所有人都可以看到"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            作品内容
          </h2>

          <div className="flex flex-col gap-4">
            <textarea
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 h-32"
              placeholder="免费预览内容。付费作品可以在这里写试看内容。"
              value={previewContent}
              onChange={(e) => setPreviewContent(e.target.value)}
            />

            <textarea
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 h-40"
              placeholder="付费隐藏内容。购买后才显示。"
              value={paidContent}
              onChange={(e) => setPaidContent(e.target.value)}
            />

            <input
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              placeholder="下载链接，例如网盘链接"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
            />

            <input
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              placeholder="提取码，没有可以留空"
              value={downloadCode}
              onChange={(e) => setDownloadCode(e.target.value)}
            />
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            售卖与发布设置
          </h2>

          <div className="flex flex-col gap-4">
            <input
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              placeholder="价格，例如 0 或 30"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <label className="flex items-center gap-3 text-zinc-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              立即发布
            </label>

            <label className="flex items-center gap-3 text-zinc-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              置顶显示
            </label>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            封面图
          </h2>

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
        </section>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
        >
          {loading ? "发布中..." : "发布帖子"}
        </button>

        <section className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">
            当前输入预览
          </h2>

          <div className="flex flex-col gap-2 text-zinc-300">
            <p>类型：{type === "WORK" ? "作品帖" : "公告帖"}</p>
            <p>标题：{title}</p>
            <p>简介：{excerpt}</p>
            <p>价格：{price}</p>
            <p>发布状态：{isPublished ? "已发布" : "草稿"}</p>
            <p>置顶：{isPinned ? "是" : "否"}</p>
            <p>封面：{image ? image.name : "未选择图片"}</p>
          </div>
        </section>
      </div>
    </main>
  );
}