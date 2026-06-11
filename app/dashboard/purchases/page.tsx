import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

function getPurchaseStatusText(status: string) {
  if (status === "PENDING") {
    return "待确认";
  }

  if (status === "PAID") {
    return "已解锁";
  }

  if (status === "REFUNDED") {
    return "已退款";
  }

  return status;
}

function getPurchaseStatusClassName(status: string) {
  if (status === "PAID") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "PENDING") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }

  if (status === "REFUNDED") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}

export default async function DashboardPurchasesPage() {
  await requireAdminPage();

  const purchases = await prisma.purchase.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          type: true,
          price: true,
          isPaid: true,
        },
      },
    },
  });

  const activePurchases = purchases.filter(
    (purchase) => purchase.status === "PAID"
  );

  const refundedCount = purchases.filter(
    (purchase) => purchase.status === "REFUNDED"
  ).length;

  const uniqueUserCount = new Set(
    activePurchases.map((purchase) => purchase.userId)
  ).size;

  const uniquePostCount = new Set(
    activePurchases.map((purchase) => purchase.postId)
  ).size;

  const totalAmount = activePurchases.reduce(
    (sum, purchase) => sum + Number(purchase.amountPaid),
    0
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回后台
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/orders"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
              >
                订单管理
              </Link>

              <Link
                href="/dashboard/posts"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
              >
                内容管理
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Purchase Access
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              购买权限
            </h1>

            <p className="max-w-2xl text-zinc-400">
              查看用户最终获得的作品解锁权限。订单支付成功后会生成购买权限；用户能否查看付费内容，以这里的记录为准。
            </p>
          </div>

          <section className="mb-10 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">{activePurchases.length}</p>
              <p className="mt-2 text-sm text-zinc-500">有效权限</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-rose-200">
                {uniqueUserCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">付费用户</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold text-yellow-300">
                {uniquePostCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">被购买作品</p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <p className="text-3xl font-bold text-emerald-200">
                ¥{totalAmount.toFixed(2)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">解锁金额</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Purchases
                </p>

                <h2 className="text-3xl font-bold">
                  权限列表
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                已退款 {refundedCount} 条
              </p>
            </div>

            {purchases.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                <p className="text-zinc-400">
                  目前还没有购买权限记录。
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <div className="hidden grid-cols-[1fr_1.6fr_1.8fr_0.8fr_0.9fr_1.2fr] gap-4 bg-white/[0.06] px-5 py-4 text-sm text-zinc-400 lg:grid">
                  <div>权限 ID</div>
                  <div>用户</div>
                  <div>作品</div>
                  <div>金额</div>
                  <div>状态</div>
                  <div>创建时间</div>
                </div>

                <div className="divide-y divide-white/10">
                  {purchases.map((purchase) => (
                    <article
                      key={purchase.id}
                      className="grid gap-4 bg-black/30 px-5 py-5 transition hover:bg-white/[0.04] lg:grid-cols-[1fr_1.6fr_1.8fr_0.8fr_0.9fr_1.2fr]"
                    >
                      <div>
                        <p className="mb-1 text-sm font-medium text-white">
                          #{purchase.id}
                        </p>

                        <p className="text-xs text-zinc-600">
                          用户 {purchase.userId} / 作品 {purchase.postId}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-zinc-200">
                          {purchase.user.name || "未命名用户"}
                        </p>

                        <p className="break-all text-xs text-zinc-500">
                          {purchase.user.email}
                        </p>
                      </div>

                      <div>
                        <Link
                          href={`/gallery/${purchase.post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-1 block text-sm text-zinc-200 hover:text-rose-200 transition"
                        >
                          {purchase.post.title}
                        </Link>

                        <p className="text-xs text-zinc-600">
                          {purchase.post.type === "WORK" ? "作品" : "公告"}
                          {purchase.post.isPaid ? " / 付费内容" : " / 免费内容"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          ¥{Number(purchase.amountPaid).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs ${getPurchaseStatusClassName(
                            purchase.status
                          )}`}
                        >
                          {getPurchaseStatusText(purchase.status)}
                        </span>
                      </div>

                      <div className="text-xs leading-6 text-zinc-500">
                        <p>{formatDateTime(purchase.createdAt)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}