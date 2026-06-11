"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFeedback } from "@/components/FeedbackProvider";
type PostType = "WORK" | "NOTICE";
type AccessType = "FREE" | "PAID";

type EditPostFormProps = {
  post: {
    id: number;
    type: PostType;
    title: string;
    excerpt: string;
    content: string;
    previewContent: string | null;
    paidContent: string | null;
    coverImage: string | null;
    downloadUrl: string | null;
    downloadCode: string | null;
    isPaid: boolean;
    price: number;
    isPublished: boolean;
    isPinned: boolean;
  };
};

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [type, setType] = useState<PostType>(post.type);
  const [accessType, setAccessType] = useState<AccessType>(
    post.isPaid ? "PAID" : "FREE"
  );

  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);

  const [previewContent, setPreviewContent] = useState(
    post.previewContent || ""
  );
  const [paidContent, setPaidContent] = useState(post.paidContent || "");
  const [downloadUrl, setDownloadUrl] = useState(post.downloadUrl || "");
  const [downloadCode, setDownloadCode] = useState(post.downloadCode || "");

  const [price, setPrice] = useState(String(post.price || 0));
  const [isPublished, setIsPublished] = useState(post.isPublished);
  const [isPinned, setIsPinned] = useState(post.isPinned);

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

  function resetPaidFields() {
    setAccessType("FREE");
    setPrice("0");
    setPaidContent("");
    setDownloadUrl("");
    setDownloadCode("");
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast("标题不能为空", "error");
      return;
    }

    if (!excerpt.trim()) {
      toast("简介不能为空", "error");
      return;
    }

    if (!content.trim()) {
      toast("正文不能为空", "error");
      return;
    }

    const priceNumber = Number(price || 0);

    if (Number.isNaN(priceNumber)) {
      toast("价格必须是数字", "error");
      return;
    }

    if (priceNumber < 0) {
      toast("价格不能小于0", "error");
      return;
    }

    if (type === "NOTICE" && accessType === "PAID") {
      toast("公告不能设置为付费内容", "error");
      return;
    }

    if (type === "WORK" && accessType === "PAID" && priceNumber <= 0) {
      toast("付费作品价格要大于0", "error");
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

    if (!response.ok || !result.success) {
      toast(result.message || "保存失败", "error");
      return;
    }

    router.push("/dashboard/posts");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard/posts"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回内容管理
            </Link>

            <Link
              href={`/gallery/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              查看前台页面
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Edit Content
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              编辑内容
            </h1>

            <p className="max-w-2xl text-zinc-400">
              修改作品或公告的信息。更换封面后，保存时会自动更新封面图。
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Basic
                  </p>
                  <h2 className="text-3xl font-bold">基础信息</h2>
                </div>

                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">内容类型</span>

                    <select
                      className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-rose-300/60"
                      value={type}
                      onChange={(e) => {
                        const nextType = e.target.value as PostType;
                        setType(nextType);

                        if (nextType === "NOTICE") {
                          resetPaidFields();
                        }
                      }}
                    >
                      <option value="WORK">作品</option>
                      <option value="NOTICE">公告</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">标题</span>

                    <input
                      className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                      placeholder="请输入标题"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">简介</span>

                    <textarea
                      className="h-28 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                      placeholder="显示在首页和列表卡片中的简短介绍"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">正文介绍</span>

                    <textarea
                      className="h-44 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                      placeholder="所有人都能看到的正文介绍"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Content
                  </p>
                  <h2 className="text-3xl font-bold">内容区域</h2>
                </div>

                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">
                      免费预览 / 公开内容
                    </span>

                    <textarea
                      className="h-36 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                      placeholder="免费作品可以写完整说明；付费作品可以写试看内容"
                      value={previewContent}
                      onChange={(e) => setPreviewContent(e.target.value)}
                    />
                  </label>

                  {type === "WORK" && accessType === "PAID" ? (
                    <>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-zinc-400">
                          付费隐藏内容
                        </span>

                        <textarea
                          className="h-44 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                          placeholder="购买后才显示的内容"
                          value={paidContent}
                          onChange={(e) => setPaidContent(e.target.value)}
                        />
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-zinc-400">下载链接</span>

                        <input
                          className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                          placeholder="例如网盘链接"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                        />
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-zinc-400">提取码</span>

                        <input
                          className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                          placeholder="没有可以留空"
                          value={downloadCode}
                          onChange={(e) => setDownloadCode(e.target.value)}
                        />
                      </label>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-400">
                      当前是免费作品或公告，不需要填写付费隐藏内容和下载信息。
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Cover
                  </p>
                  <h2 className="text-3xl font-bold">封面图</h2>
                </div>

                <div className="flex flex-col gap-5">
                  {post.coverImage && !previewUrl && (
                    <div>
                      <p className="mb-3 text-sm text-zinc-400">当前封面</p>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                        <img
                          src={post.coverImage}
                          alt="当前封面"
                          className="max-h-[360px] w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImage(e.target.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-rose-100"
                  />

                  {previewUrl ? (
                    <div>
                      <p className="mb-3 text-sm text-zinc-400">新封面预览</p>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                        <img
                          src={previewUrl}
                          alt="新封面预览"
                          className="max-h-[360px] w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : !post.coverImage ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-10 text-center text-zinc-500">
                      当前没有封面，选择图片后会在这里显示预览
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 lg:sticky lg:top-8">
              <div className="mb-6">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Save
                </p>
                <h2 className="text-3xl font-bold">保存设置</h2>
              </div>

              <div className="flex flex-col gap-6">
                {type === "WORK" ? (
                  <div>
                    <p className="mb-3 text-sm text-zinc-400">收费类型</p>

                    <div className="grid grid-cols-2 rounded-full bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => resetPaidFields()}
                        className={
                          accessType === "FREE"
                            ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                            : "rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-white"
                        }
                      >
                        免费
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
                            ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                            : "rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-white"
                        }
                      >
                        付费
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-zinc-400">
                    公告默认免费，不支持设置付费内容。
                  </div>
                )}

                {type === "WORK" && accessType === "PAID" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-zinc-400">价格</span>

                    <input
                      className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                      placeholder="例如 30"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </label>
                )}

                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/30 p-5">
                  <label className="flex items-center justify-between gap-4">
                    <span className="text-zinc-300">已发布</span>

                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4">
                    <span className="text-zinc-300">置顶显示</span>

                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                    />
                  </label>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-4 text-sm font-bold text-white">
                    当前预览
                  </p>

                  <div className="flex flex-col gap-2 text-sm text-zinc-400">
                    <p>ID：{post.id}</p>
                    <p>类型：{type === "WORK" ? "作品" : "公告"}</p>
                    <p>
                      收费：
                      {type === "NOTICE"
                        ? "免费"
                        : accessType === "PAID"
                          ? `付费 ¥${price || 0}`
                          : "免费"}
                    </p>
                    <p>状态：{isPublished ? "已发布" : "草稿"}</p>
                    <p>置顶：{isPinned ? "是" : "否"}</p>
                    <p>
                      封面：
                      {image
                        ? image.name
                        : post.coverImage
                          ? "保留当前封面"
                          : "无封面"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
                >
                  {loading ? "保存中..." : "保存修改"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}