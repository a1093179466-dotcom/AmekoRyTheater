import Link from "next/link";

import EmailNotificationSettingsForm from "@/components/EmailNotificationSettingsForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { requireUserPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const preferenceSelect = {
  emailNotifyCommentReply: true,
  emailNotifyPurchase: true,
  emailNotifyNewPost: true,
};

export default async function ProfileSettingsPage() {
  const user = await requireUserPage();

  const preferences = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: preferenceSelect,
  });

  const initialPreferences = preferences ?? {
    emailNotifyCommentReply: true,
    emailNotifyPurchase: true,
    emailNotifyNewPost: false,
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
                Account Settings
              </p>

              <h1 className="mb-4 text-5xl font-black tracking-tight">
                账户设置
              </h1>

              <p className="max-w-2xl text-zinc-400">
                管理账号邮件提醒偏好。
              </p>
            </div>

            <Link
              href="/profile"
              className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-300/40 hover:bg-white/10 hover:text-white"
            >
              返回个人中心
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                Email
              </p>

              <h2 className="text-3xl font-bold">
                邮件通知
              </h2>
            </div>

            <EmailNotificationSettingsForm
              initialPreferences={initialPreferences}
            />
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}