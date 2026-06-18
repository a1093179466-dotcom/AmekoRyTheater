"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useFeedback } from "@/components/FeedbackProvider";

type SiteSettingFormValue = {
  siteTitle: string;
  siteSubtitle: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeBackgroundImage: string;
  homeHeroImage: string;
  tickerEnabled: boolean;
  tickerText: string;
  aboutText: string;
  contactEmail: string;
  externalLinkText: string;
  externalLinkUrl: string;
  youtubeEnabled: boolean;
  youtubeUrl: string;
  xEnabled: boolean;
  xUrl: string;
  pixivEnabled: boolean;
  pixivUrl: string;
};

type SiteSettingsFormProps = {
  setting: SiteSettingFormValue;
};

type SaveResponse = {
  success?: boolean;
  message?: string;
  setting?: Partial<SiteSettingFormValue>;
};

type VisualAssetInputProps = {
  title: string;
  description: string;
  url: string;
  file: File | null;
  previewUrl: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
};

function appendBoolean(formData: FormData, key: string, value: boolean) {
  formData.append(key, value ? "true" : "false");
}

function getPreviewStyle(imageUrl: string): CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.62)), url(${JSON.stringify(
      imageUrl
    )})`,
  };
}

function VisualAssetInput({
  title,
  description,
  url,
  file,
  previewUrl,
  inputRef,
  onUrlChange,
  onFileChange,
  onClear,
}: VisualAssetInputProps) {
  const hasImage = Boolean(previewUrl);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!url && !file}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-300 transition hover:border-rose-300/40 hover:bg-rose-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          清空图片
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">图片 URL</span>
          <input
            type="url"
            className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
            placeholder="https://... 或 /uploads/site-settings/..."
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">上传本地图片</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-sm text-zinc-300 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-rose-100 focus:ring-1 focus:ring-rose-300/60"
            onChange={(event) =>
              onFileChange(event.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      <div className="mt-5">
        {hasImage ? (
          <div
            className="flex min-h-[220px] items-end overflow-hidden rounded-3xl border border-white/10 bg-cover bg-center shadow-2xl shadow-black/30"
            style={getPreviewStyle(previewUrl)}
          >
            <div className="w-full bg-black/45 px-4 py-3 text-sm text-zinc-200 backdrop-blur">
              {file ? "本地预览，保存后生效" : "当前图片预览"}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/30 text-sm text-zinc-600">
            暂未配置图片
          </div>
        )}
      </div>
    </div>
  );
}

export default function SiteSettingsForm({ setting }: SiteSettingsFormProps) {
  const router = useRouter();
  const { toast } = useFeedback();

  const [siteTitle, setSiteTitle] = useState(setting.siteTitle);
  const [siteSubtitle, setSiteSubtitle] = useState(setting.siteSubtitle);
  const [homeHeroTitle, setHomeHeroTitle] = useState(setting.homeHeroTitle);
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState(
    setting.homeHeroSubtitle
  );
  const [homeBackgroundImage, setHomeBackgroundImage] = useState(
    setting.homeBackgroundImage
  );
  const [homeHeroImage, setHomeHeroImage] = useState(setting.homeHeroImage);
  const [homeBackgroundImageFile, setHomeBackgroundImageFile] =
    useState<File | null>(null);
  const [homeHeroImageFile, setHomeHeroImageFile] = useState<File | null>(
    null
  );
  const [tickerEnabled, setTickerEnabled] = useState(setting.tickerEnabled);
  const [tickerText, setTickerText] = useState(setting.tickerText);
  const [aboutText, setAboutText] = useState(setting.aboutText);
  const [contactEmail, setContactEmail] = useState(setting.contactEmail);
  const [externalLinkText, setExternalLinkText] = useState(
    setting.externalLinkText
  );
  const [externalLinkUrl, setExternalLinkUrl] = useState(
    setting.externalLinkUrl
  );
  const [youtubeEnabled, setYoutubeEnabled] = useState(setting.youtubeEnabled);
  const [youtubeUrl, setYoutubeUrl] = useState(setting.youtubeUrl);
  const [xEnabled, setXEnabled] = useState(setting.xEnabled);
  const [xUrl, setXUrl] = useState(setting.xUrl);
  const [pixivEnabled, setPixivEnabled] = useState(setting.pixivEnabled);
  const [pixivUrl, setPixivUrl] = useState(setting.pixivUrl);
  const [loading, setLoading] = useState(false);

  const homeBackgroundInputRef = useRef<HTMLInputElement>(null);
  const homeHeroInputRef = useRef<HTMLInputElement>(null);

  const homeBackgroundLocalPreview = useMemo(() => {
    if (!homeBackgroundImageFile) {
      return "";
    }

    return URL.createObjectURL(homeBackgroundImageFile);
  }, [homeBackgroundImageFile]);

  const homeHeroLocalPreview = useMemo(() => {
    if (!homeHeroImageFile) {
      return "";
    }

    return URL.createObjectURL(homeHeroImageFile);
  }, [homeHeroImageFile]);

  useEffect(() => {
    if (!homeBackgroundLocalPreview) {
      return;
    }

    return () => URL.revokeObjectURL(homeBackgroundLocalPreview);
  }, [homeBackgroundLocalPreview]);

  useEffect(() => {
    if (!homeHeroLocalPreview) {
      return;
    }

    return () => URL.revokeObjectURL(homeHeroLocalPreview);
  }, [homeHeroLocalPreview]);

  const homeBackgroundPreview =
    homeBackgroundLocalPreview || homeBackgroundImage.trim();
  const homeHeroPreview = homeHeroLocalPreview || homeHeroImage.trim();

  function clearHomeBackgroundImage() {
    setHomeBackgroundImage("");
    setHomeBackgroundImageFile(null);

    if (homeBackgroundInputRef.current) {
      homeBackgroundInputRef.current.value = "";
    }
  }

  function clearHomeHeroImage() {
    setHomeHeroImage("");
    setHomeHeroImageFile(null);

    if (homeHeroInputRef.current) {
      homeHeroInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!siteTitle.trim()) {
      toast("站点标题不能为空", "error");
      return;
    }

    if (!homeHeroTitle.trim()) {
      toast("首页主标题不能为空", "error");
      return;
    }

    if (tickerEnabled && !tickerText.trim()) {
      toast("开启滚动公告时，公告内容不能为空", "error");
      return;
    }

    const formData = new FormData();

    formData.append("siteTitle", siteTitle);
    formData.append("siteSubtitle", siteSubtitle);
    formData.append("homeHeroTitle", homeHeroTitle);
    formData.append("homeHeroSubtitle", homeHeroSubtitle);
    formData.append("homeBackgroundImage", homeBackgroundImage);
    formData.append("homeHeroImage", homeHeroImage);
    appendBoolean(formData, "tickerEnabled", tickerEnabled);
    formData.append("tickerText", tickerText);
    formData.append("aboutText", aboutText);
    formData.append("contactEmail", contactEmail);
    formData.append("externalLinkText", externalLinkText);
    formData.append("externalLinkUrl", externalLinkUrl);
    appendBoolean(formData, "youtubeEnabled", youtubeEnabled);
    formData.append("youtubeUrl", youtubeUrl);
    appendBoolean(formData, "xEnabled", xEnabled);
    formData.append("xUrl", xUrl);
    appendBoolean(formData, "pixivEnabled", pixivEnabled);
    formData.append("pixivUrl", pixivUrl);

    if (homeBackgroundImageFile) {
      formData.append("homeBackgroundImageFile", homeBackgroundImageFile);
    }

    if (homeHeroImageFile) {
      formData.append("homeHeroImageFile", homeHeroImageFile);
    }

    setLoading(true);

    try {
      const response = await fetch("/api/site-settings", {
        method: "PATCH",
        body: formData,
      });

      const result = (await response.json().catch(() => ({}))) as SaveResponse;

      if (!response.ok || !result.success) {
        toast(result.message || "保存失败", "error");
        return;
      }

      if (typeof result.setting?.homeBackgroundImage === "string") {
        setHomeBackgroundImage(result.setting.homeBackgroundImage);
      }

      if (typeof result.setting?.homeHeroImage === "string") {
        setHomeHeroImage(result.setting.homeHeroImage);
      }

      setHomeBackgroundImageFile(null);
      setHomeHeroImageFile(null);

      if (homeBackgroundInputRef.current) {
        homeBackgroundInputRef.current.value = "";
      }

      if (homeHeroInputRef.current) {
        homeHeroInputRef.current.value = "";
      }

      toast("站点设置已保存", "success");
      router.refresh();
    } catch {
      toast("保存失败，请稍后再试", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
      <div className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Basic
          </p>

          <h2 className="mb-6 text-3xl font-bold">基础信息</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">站点标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={siteTitle}
                onChange={(event) => setSiteTitle(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">站点副标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={siteSubtitle}
                onChange={(event) => setSiteSubtitle(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Home
          </p>

          <h2 className="mb-6 text-3xl font-bold">首页文案</h2>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">首页主标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={homeHeroTitle}
                onChange={(event) => setHomeHeroTitle(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">首页副标题</span>

              <textarea
                className="h-28 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={homeHeroSubtitle}
                onChange={(event) => setHomeHeroSubtitle(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Visual Assets
          </p>

          <h2 className="mb-6 text-3xl font-bold">首页视觉资源</h2>

          <div className="grid gap-5">
            <VisualAssetInput
              title="首页背景图"
              description="用于首页顶部区域的背景装饰，前台会自动加深色遮罩，保证文字可读。"
              url={homeBackgroundImage}
              file={homeBackgroundImageFile}
              previewUrl={homeBackgroundPreview}
              inputRef={homeBackgroundInputRef}
              onUrlChange={setHomeBackgroundImage}
              onFileChange={setHomeBackgroundImageFile}
              onClear={clearHomeBackgroundImage}
            />

            <VisualAssetInput
              title="首页 Hero 图"
              description="用于首页主视觉区域，适合放作品氛围图、横幅图或代表性插画。"
              url={homeHeroImage}
              file={homeHeroImageFile}
              previewUrl={homeHeroPreview}
              inputRef={homeHeroInputRef}
              onUrlChange={setHomeHeroImage}
              onFileChange={setHomeHeroImageFile}
              onClear={clearHomeHeroImage}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Ticker
          </p>

          <h2 className="mb-6 text-3xl font-bold">首页滚动公告</h2>

          <div className="flex flex-col gap-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-300">开启滚动公告</span>

              <input
                type="checkbox"
                checked={tickerEnabled}
                onChange={(event) => setTickerEnabled(event.target.checked)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">公告内容</span>

              <textarea
                className="h-24 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="例如：新作品已发布 / 网站维护通知 / 平台链接说明"
                value={tickerText}
                onChange={(event) => setTickerText(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Footer
          </p>

          <h2 className="mb-6 text-3xl font-bold">联系与说明</h2>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">关于页面内容</span>

              <textarea
                className="h-28 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="写一点站点介绍或创作者说明"
                value={aboutText}
                onChange={(event) => setAboutText(event.target.value)}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-zinc-400">联系邮箱</span>

                <input
                  className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                  placeholder="contact@example.com"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-zinc-400">外部平台名称</span>

                <input
                  className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                  placeholder="例如 Pixiv / X / 爱发电"
                  value={externalLinkText}
                  onChange={(event) => setExternalLinkText(event.target.value)}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">外部平台链接</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="https://..."
                value={externalLinkUrl}
                onChange={(event) => setExternalLinkUrl(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Platforms
          </p>

          <h2 className="mb-6 text-3xl font-bold">平台图标</h2>

          <p className="mb-6 text-sm leading-6 text-zinc-500">
            勾选后会在网站底部显示对应平台图标。用户点击图标后会跳转到你填写的链接。
          </p>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <label className="mb-4 flex items-center justify-between gap-4">
                <span className="font-medium text-zinc-200">
                  显示 YouTube
                </span>

                <input
                  type="checkbox"
                  checked={youtubeEnabled}
                  onChange={(event) =>
                    setYoutubeEnabled(event.target.checked)
                  }
                />
              </label>

              <input
                className="w-full rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="https://www.youtube.com/@yourname"
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <label className="mb-4 flex items-center justify-between gap-4">
                <span className="font-medium text-zinc-200">显示 X</span>

                <input
                  type="checkbox"
                  checked={xEnabled}
                  onChange={(event) => setXEnabled(event.target.checked)}
                />
              </label>

              <input
                className="w-full rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="https://x.com/yourname"
                value={xUrl}
                onChange={(event) => setXUrl(event.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <label className="mb-4 flex items-center justify-between gap-4">
                <span className="font-medium text-zinc-200">显示 Pixiv</span>

                <input
                  type="checkbox"
                  checked={pixivEnabled}
                  onChange={(event) => setPixivEnabled(event.target.checked)}
                />
              </label>

              <input
                className="w-full rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="https://www.pixiv.net/users/123456"
                value={pixivUrl}
                onChange={(event) => setPixivUrl(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-rose-100 disabled:bg-zinc-500"
          >
            {loading ? "保存中..." : "保存站点设置"}
          </button>
        </div>
      </div>
    </section>
  );
}
