"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFeedback } from "@/components/FeedbackProvider";

type SiteSettingsFormProps = {
  setting: {
    siteTitle: string;
    siteSubtitle: string;
    homeHeroTitle: string;
    homeHeroSubtitle: string;
    tickerEnabled: boolean;
    tickerText: string;
    aboutText: string;
    contactEmail: string;
    externalLinkText: string;
    externalLinkUrl: string;
  };
};

export default function SiteSettingsForm({
  setting,
}: SiteSettingsFormProps) {
  const router = useRouter();
  const { toast } = useFeedback();

  const [siteTitle, setSiteTitle] = useState(setting.siteTitle);
  const [siteSubtitle, setSiteSubtitle] = useState(setting.siteSubtitle);
  const [homeHeroTitle, setHomeHeroTitle] = useState(setting.homeHeroTitle);
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState(
    setting.homeHeroSubtitle
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

  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    const response = await fetch("/api/site-settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        siteTitle,
        siteSubtitle,
        homeHeroTitle,
        homeHeroSubtitle,
        tickerEnabled,
        tickerText,
        aboutText,
        contactEmail,
        externalLinkText,
        externalLinkUrl,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.success) {
      toast(result.message || "保存失败", "error");
      return;
    }

    toast("站点设置已保存", "success");
    router.refresh();
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
      <div className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Basic
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            基础信息
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">站点标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">站点副标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={siteSubtitle}
                onChange={(e) => setSiteSubtitle(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Home
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            首页文案
          </h2>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">首页主标题</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={homeHeroTitle}
                onChange={(e) => setHomeHeroTitle(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">首页副标题</span>

              <textarea
                className="h-28 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                value={homeHeroSubtitle}
                onChange={(e) => setHomeHeroSubtitle(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Ticker
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            首页滚动公告
          </h2>

          <div className="flex flex-col gap-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-300">开启滚动公告</span>

              <input
                type="checkbox"
                checked={tickerEnabled}
                onChange={(e) => setTickerEnabled(e.target.checked)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">公告内容</span>

              <textarea
                className="h-24 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="例如：新作品已发布 / 网站维护通知 / 平台链接说明"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Footer
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            联系与说明
          </h2>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">关于说明</span>

              <textarea
                className="h-28 rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="写一点站点介绍或创作者说明"
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-zinc-400">联系邮箱</span>

                <input
                  className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                  placeholder="contact@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-zinc-400">外部平台名称</span>

                <input
                  className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                  placeholder="例如 Pixiv / X / 爱发电"
                  value={externalLinkText}
                  onChange={(e) => setExternalLinkText(e.target.value)}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-400">外部平台链接</span>

              <input
                className="rounded-2xl bg-black/60 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-300/60"
                placeholder="https://..."
                value={externalLinkUrl}
                onChange={(e) => setExternalLinkUrl(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-rose-100 transition disabled:bg-zinc-500"
          >
            {loading ? "保存中..." : "保存站点设置"}
          </button>
        </div>
      </div>
    </section>
  );
}