"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EditPostFormProps = {
  post: {
    id: number;
    type: string;
    title: string;
    excerpt: string;
    content: string;
    previewContent: string;
    paidContent: string;
    coverImage: string;
    downloadUrl: string | null;
    downloadCode: string | null;
    isPaid: boolean;
    price: number;
    isPublished: boolean;
    isPinned: boolean;
  };
};

/**
 * 编辑帖子表单。
 *
 * 这是客户端组件，因为它需要：
 * - useState 管理表单输入
 * - useEffect 生成本地封面预览
 * - onClick 提交 PATCH 请求
 */
export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  // 基础信息
  const [type, setType] = useState(post.type);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);

  // 付费/免费状态
  const [accessType, setAccessType] = useState(
    post.isPaid ? "PAID" : "FREE"
  );

  // 作品内容
  const [previewContent, setPreviewContent] = useState(
    post.previewContent
  );
  const [paidContent, setPaidContent] = useState(post.paidContent);
  const [downloadUrl, setDownloadUrl] = useState(post.downloadUrl || "");
  const [downloadCode, setDownloadCode] = useState(post.downloadCode || "");

  // 售卖与发布设置
  const [price, setPrice] = useState(String(post.price));
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPinned, setIsPinned] = useState(post.isPinned);

  // 新封面图文件
  const [image, setImage] = useState<File | null>(null);

  // 新封面图本地预览地址
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    // 为新选择的本地图片生成临时预览地址
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    // 释放临时地址，避免内存泄漏
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

    const priceNumber = Number(price || 0);

    if (isNaN(priceNumber)) {
      alert("价格必须是数字");
      return;
    }

    if (priceNumber < 0) {
      alert("价格不能小于 0");
      return;
    }

    if (type === "NOTICE" && accessType === "PAID") {
      alert("公告帖不能设置为付费作品");
      return;
    }

    if (type === "WORK" && accessType === "PAID" && priceNumber <= 0) {
      alert("付费作品价格必须大于 0");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("type", type);
    formData.append("accessType", accessType);
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("previewContent", previewContent);

    // 免费作品不提交付费内容和下载信息
    formData.append(
      "paidContent",
      accessType === "PAID" ? paidContent : ""
    );

    formData.append(
      "downloadUrl",
      accessType === "PAID" ? downloadUrl : ""
    );

    formData.append(
      "downloadCode",
      accessType === "PAID" ? downloadCode : ""
    );

    formData.append(
      "price",
      accessType === "PAID" ? String(priceNumber) : "0"
    );

    formData.append("isPublished", String(isPublished));
    formData.append("isPinned", String(isPinned));

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

    router.push(`/gallery/${post.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          基础信息
        </h2>

        <div className="flex flex-col gap-4">
          <select
            className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
            value={type}
            onChange={(e) => {
              const nextType = e.target.value;

              setType(nextType);

              // 如果切换成公告帖，就清空售卖相关内容。
              if (nextType === "NOTICE") {
                setAccessType("FREE");
                setPrice("0");
                setPaidContent("");
                setDownloadUrl("");
                setDownloadCode("");
              }
            }}
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
            placeholder="免费预览内容。免费作品可以写完整说明；付费作品可以写试看内容。"
            value={previewContent}
            onChange={(e) => setPreviewContent(e.target.value)}
          />

          {type === "WORK" && accessType === "PAID" ? (
            <>
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
            </>
          ) : (
            <p className="text-zinc-500 text-sm">
              当前是免费作品或公告帖，不需要填写付费隐藏内容和下载信息。
            </p>
          )}
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          售卖与发布设置
        </h2>

        <div className="flex flex-col gap-4">
          {type === "WORK" ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAccessType("FREE");
                  setPrice("0");
                  setPaidContent("");
                  setDownloadUrl("");
                  setDownloadCode("");
                }}
                className={
                  accessType === "FREE"
                    ? "bg-white text-black px-4 py-2 rounded-xl"
                    : "bg-black border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300"
                }
              >
                免费作品
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccessType("PAID");
                  if (price === "0" || price === "") {
                    setPrice("30");
                  }
                }}
                className={
                  accessType === "PAID"
                    ? "bg-white text-black px-4 py-2 rounded-xl"
                    : "bg-black border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300"
                }
              >
                付费作品
              </button>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">
              公告帖默认免费，不支持设置付费内容。
            </p>
          )}

          {type === "WORK" && accessType === "PAID" && (
            <input
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
              placeholder="付费作品价格，例如 30"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}

          {type === "WORK" && accessType === "FREE" && (
            <p className="text-zinc-500 text-sm">
              当前选择免费作品，价格会自动保存为 0。
            </p>
          )}

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

        <p className="text-zinc-400 mb-3">
          当前封面
        </p>

        <img
          src={post.coverImage}
          alt="当前封面"
          className="w-full max-w-sm rounded-xl border border-zinc-700 mb-4"
        />

        <p className="text-zinc-400 mb-3">
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
      </section>

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