import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getDisplayOrderNo } from "@/lib/order";

export const dynamic = "force-dynamic";

function getOrderStatusText(status: string) {
  if (status === "PENDING") {
    return "待支付";
  }

  if (status === "PAID") {
    return "已支付";
  }

  if (status === "CANCELLED") {
    return "已取消";
  }

  return status;
}

function getOrderStatusClassName(status: string) {
  if (status === "PENDING") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }

  if (status === "PAID") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "CANCELLED") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}

export default async function DashboardOrdersPage() {
  await requireAdminPage();

  const orders = await prisma.order.findMany({
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
          isPaid: true,
          price: true,
        },
      },
    },
  });

  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const paidCount = orders.filter((order) => order.status === "PAID").length;
  const cancelledCount = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  const paidTotal = orders
    .filter((order) => order.status === "PAID")
    .reduce((sum, order) => sum + Number(order.amount), 0);

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

            <Link
              href="/dashboard/posts"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              内容管理
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Order Management
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              订单管理
            </h1>

            <p className="max-w-2xl text-zinc-400">
              查看用户创建的订单、支付状态、关联作品和支付流水信息。当前仍为模拟支付流程，后续接入真实支付后会在这里显示平台流水号。
            </p>
          </div>

          <section className="mb-10 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">{orders.length}</p>
              <p className="mt-2 text-sm text-zinc-500">订单总数</p>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
              <p className="text-3xl font-bold text-yellow-200">
                {pendingCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">待支付</p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <p className="text-3xl font-bold text-emerald-200">
                {paidCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">已支付</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-3xl font-bold">
                ¥{paidTotal.toFixed(2)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                已支付金额
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Orders
                </p>

                <h2 className="text-3xl font-bold">
                  订单列表
                </h2>
              </div>

              <p className="text-sm text-zinc-500">
                已取消 {cancelledCount} 笔
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                <p className="text-zinc-400">
                  目前还没有订单。
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <div className="hidden grid-cols-[1.4fr_1.5fr_1.6fr_0.8fr_0.9fr_1.2fr] gap-4 bg-white/[0.06] px-5 py-4 text-sm text-zinc-400 lg:grid">
                  <div>订单号</div>
                  <div>用户</div>
                  <div>作品</div>
                  <div>金额</div>
                  <div>状态</div>
                  <div>时间</div>
                </div>

                <div className="divide-y divide-white/10">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="grid gap-4 bg-black/30 px-5 py-5 transition hover:bg-white/[0.04] lg:grid-cols-[1.4fr_1.5fr_1.6fr_0.8fr_0.9fr_1.2fr]"
                    >
                      <div>
                        <p className="mb-1 text-sm font-medium text-white">
                          {getDisplayOrderNo(order)}
                        </p>

                        <p className="text-xs text-zinc-600">
                          内部 ID：{order.id}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-zinc-200">
                          {order.user.name || "未命名用户"}
                        </p>

                        <p className="break-all text-xs text-zinc-500">
                          {order.user.email}
                        </p>
                      </div>

                      <div>
                        <Link
                          href={`/gallery/${order.post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-1 block text-sm text-zinc-200 hover:text-rose-200 transition"
                        >
                          {order.post.title}
                        </Link>

                        <p className="text-xs text-zinc-600">
                          作品 ID：{order.post.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          ¥{Number(order.amount).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs ${getOrderStatusClassName(
                            order.status
                          )}`}
                        >
                          {getOrderStatusText(order.status)}
                        </span>

                        {order.paymentType && (
                          <p className="mt-2 text-xs text-zinc-600">
                            {order.paymentType}
                          </p>
                        )}
                      </div>

                      <div className="text-xs leading-6 text-zinc-500">
                        <p>创建：{formatDateTime(order.createdAt)}</p>

                        {order.paidAt ? (
                          <p>支付：{formatDateTime(order.paidAt)}</p>
                        ) : (
                          <p>支付：未支付</p>
                        )}

                        {order.expiresAt && order.status === "PENDING" && (
                          <p>过期：{formatDateTime(order.expiresAt)}</p>
                        )}

                        {order.providerTradeNo && (
                          <p className="break-all">
                            流水：{order.providerTradeNo}
                          </p>
                        )}
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