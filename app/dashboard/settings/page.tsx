import Link from "next/link";

import { requireAdminPage } from "@/lib/auth";
import { getSiteSetting } from "@/lib/siteSetting";

import SiteSettingsForm from "@/components/SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  await requireAdminPage();

  const setting = await getSiteSetting();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回后台
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              查看首页
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Site Settings
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              站点设置
            </h1>

            <p className="max-w-2xl text-zinc-400">
              管理首页标题、站点副标题、首页视觉资源、滚动公告、联系信息和外部平台链接。
            </p>
          </div>

          <SiteSettingsForm
            setting={{
              siteTitle: setting.siteTitle,
              siteSubtitle: setting.siteSubtitle,
              homeHeroTitle: setting.homeHeroTitle,
              homeHeroSubtitle: setting.homeHeroSubtitle,
              homeBackgroundImage: setting.homeBackgroundImage,
              homeHeroImage: setting.homeHeroImage,
              tickerEnabled: setting.tickerEnabled,
              tickerText: setting.tickerText,
              aboutText: setting.aboutText,
              contactEmail: setting.contactEmail,
              externalLinkText: setting.externalLinkText,
              externalLinkUrl: setting.externalLinkUrl,
              youtubeEnabled: setting.youtubeEnabled,
              youtubeUrl: setting.youtubeUrl,
              xEnabled: setting.xEnabled,
              xUrl: setting.xUrl,
              pixivEnabled: setting.pixivEnabled,
              pixivUrl: setting.pixivUrl,
            }}
          />
        </div>
      </section>
    </main>
  );
}
