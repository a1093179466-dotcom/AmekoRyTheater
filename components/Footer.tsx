import Link from "next/link";

import { getSiteSetting } from "@/lib/siteSetting";

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4 0 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.2 14.8V8.6l5.8 3.1-5.8 3.1Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M18.2 3h3.1l-6.8 7.8L22.5 21h-6.3l-4.9-6.4L5.7 21H2.6l7.3-8.4L2.2 3h6.4l4.4 5.8L18.2 3Zm-1.1 16.2h1.7L7.7 4.7H5.9l11.2 14.5Z"
      />
    </svg>
  );
}

function PixivIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M6.5 21V3h7.2c3.7 0 6.1 2.2 6.1 5.6s-2.5 5.8-6.2 5.8H10V21H6.5Zm3.5-9.7h3.1c2 0 3.1-1 3.1-2.7 0-1.6-1.1-2.6-3.1-2.6H10v5.3Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 8 8-5.2V7l-8 5.2L4 7v.8L12 13Z"
      />
    </svg>
  );
}

type PlatformLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export default async function Footer() {
  const setting = await getSiteSetting();

  const currentYear = new Date().getFullYear();

  const platformLinks: PlatformLink[] = [];

  if (setting.contactEmail.trim()) {
    platformLinks.push({
      label: "Email",
      href: `mailto:${setting.contactEmail}`,
      icon: <MailIcon />,
    });
  }

  if (setting.youtubeEnabled && setting.youtubeUrl.trim()) {
    platformLinks.push({
      label: "YouTube",
      href: setting.youtubeUrl,
      icon: <YouTubeIcon />,
    });
  }

  if (setting.xEnabled && setting.xUrl.trim()) {
    platformLinks.push({
      label: "X",
      href: setting.xUrl,
      icon: <XIcon />,
    });
  }

  if (setting.pixivEnabled && setting.pixivUrl.trim()) {
    platformLinks.push({
      label: "Pixiv",
      href: setting.pixivUrl,
      icon: <PixivIcon />,
    });
  }

  return (
    <footer className="border-t border-white/10 bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
            {setting.siteSubtitle || "Personal Creation Theater"}
          </p>

          <h2 className="mb-4 text-3xl font-black">
            {setting.siteTitle || "AmekoRyTheater"}
          </h2>

          <p className="max-w-xl leading-7 text-zinc-400">
            {setting.aboutText ||
              "个人创作者内容站，用于发布作品、公告和付费内容。"}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">
            站内导航
          </h3>

          <div className="flex flex-col gap-3 text-sm text-zinc-400">
            <Link
              href="/"
              className="hover:text-white transition"
            >
              首页
            </Link>

            <Link
              href="/gallery"
              className="hover:text-white transition"
            >
              作品
            </Link>

            <Link
              href="/notices"
              className="hover:text-white transition"
            >
              公告
            </Link>

            <Link
              href="/profile"
              className="hover:text-white transition"
            >
              个人中心
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">
            联系方式
          </h3>

          {platformLinks.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {platformLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    item.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  aria-label={item.label}
                  title={item.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-rose-300/40 hover:bg-white/[0.08] hover:text-white"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              暂未设置联系方式
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-600">
        <p>
          © {currentYear} {setting.siteTitle || "AmekoRyTheater"}. All rights reserved.
        </p>

        <p>
          购买作品仅获得个人查看权限，不代表获得作品版权。
        </p>
      </div>
    </footer>
  );
}