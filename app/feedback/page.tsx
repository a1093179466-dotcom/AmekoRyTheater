import FeedbackForm from "@/components/FeedbackForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const currentUser = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="pt-4">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Feedback
            </p>

            <h1 className="mb-5 text-5xl font-black tracking-tight md:text-6xl">
              用户反馈
            </h1>

            <p className="max-w-xl text-lg leading-8 text-zinc-400">
              遇到问题、购买异常，或者有想看的功能，都可以从这里发给站点管理员。
            </p>

            <div className="mt-8 grid gap-3 text-sm text-zinc-500">
              <p className="rounded-2xl border border-white/10 bg-black/30 p-4">
                登录用户提交后会自动关联账号，游客也可以直接提交。
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/30 p-4">
                购买问题建议留下联系邮箱，方便后续核对订单。
              </p>
            </div>
          </div>

          <FeedbackForm
            initialEmail={currentUser?.email ?? ""}
            isLoggedIn={Boolean(currentUser)}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
