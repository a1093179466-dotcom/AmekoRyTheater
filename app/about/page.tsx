import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSetting } from "@/lib/siteSetting";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [setting, currentUser] = await Promise.all([
    getSiteSetting(),
    getCurrentUser(),
  ]);

  const aboutText = setting.aboutText.trim();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
                About
              </p>

              <h1 className="mb-4 text-5xl font-black tracking-tight">
                关于
              </h1>

              <p className="max-w-2xl text-zinc-400">
                这里记录创作者、站点和作品发布计划相关的信息。
              </p>
            </div>

            {currentUser?.role === "ADMIN" && (
              <Link
                href="/dashboard/settings"
                className="w-fit rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-rose-100"
              >
                编辑关于页面
              </Link>
            )}
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 md:p-8">
            {aboutText ? (
              <p className="whitespace-pre-line leading-8 text-zinc-300">
                {aboutText}
              </p>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
                <p className="mb-3 text-2xl font-bold text-white">
                  关于内容还在准备中
                </p>

                <p className="text-zinc-400">
                  这里会陆续补充创作者与站点说明。
                </p>
              </div>
            )}
          </section>

          {(setting.contactEmail || setting.externalLinkText) && (
            <section className="mt-6 grid gap-4 md:grid-cols-2">
              {setting.contactEmail && (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Contact
                  </p>

                  <a
                    href={`mailto:${setting.contactEmail}`}
                    className="break-all text-zinc-200 underline transition hover:text-white"
                  >
                    {setting.contactEmail}
                  </a>
                </div>
              )}

              {setting.externalLinkText && setting.externalLinkUrl && (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Link
                  </p>

                  <a
                    href={setting.externalLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 underline transition hover:text-white"
                  >
                    {setting.externalLinkText}
                  </a>
                </div>
              )}
            </section>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
