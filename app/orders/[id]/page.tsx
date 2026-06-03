import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PayOrderButton from "@/components/PayOrderButton";
import CancelOrderButton from "@/components/CancelOrderButton";

import { prisma } from "@/lib/prisma";
import { requireUserPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getDisplayOrderNo } from "@/lib/order";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

/**
 * 订单详情页
 *
 * 路径：
 * /orders/[id]
 *
 * 当前作用：
 * - 查看订单详情
 * - 待支付订单可以模拟支付
 * - 待支付订单可以手动取消
 *
 * 以后接入真实支付时：
 * - 这里可以显示真实支付入口
 * - 支付成功后由后端回调更新订单状态并创建 Purchase
 */
export default async function OrderDetailPage({ params }: PageProps) {
  const user = await requireUserPage();

  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Navbar />

        <section className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold">
            订单不存在
          </h1>

          <p className="text-zinc-400">
            无效的订单 ID：{id}
          </p>
        </section>

        <Footer />
      </main>
    );
  }

  // 进入订单页时，顺手把已经超时的待支付订单标记为取消。
  await prisma.order.updateMany({
    where: {
      id: orderId,
      status: "PENDING",
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          excerpt: true,
          coverImage: true,
          price: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Navbar />

        <section className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold">
            订单不存在
          </h1>

          <Link
            href="/profile"
            className="text-zinc-400 underline hover:text-white transition"
          >
            返回个人中心
          </Link>
        </section>

        <Footer />
      </main>
    );
  }

  // 普通用户只能查看自己的订单。
  // 管理员可以查看所有订单，方便排查问题。
  if (order.userId !== user.id && user.role !== "ADMIN") {
    redirect("/");
  }

  function getStatusLabel(status: string) {
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

  function getStatusClassName(status: string) {
    if (status === "PENDING") {
      return "border-yellow-800 bg-yellow-900/30 text-yellow-300";
    }

    if (status === "PAID") {
      return "border-green-800 bg-green-900/30 text-green-300";
    }

    if (status === "CANCELLED") {
      return "border-red-800 bg-red-900/30 text-red-300";
    }

    return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }

  const isPending = order.status === "PENDING";
  const isPaid = order.status === "PAID";
  const isCancelled = order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/gallery/${order.post.id}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回作品详情
            </Link>

            <Link
              href="/profile"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              个人中心
            </Link>
          </div>

          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Order Detail
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              订单详情
            </h1>

            <p className="max-w-2xl text-zinc-400">
              查看订单状态、支付金额和对应作品。待支付订单可以在有效期内完成支付，也可以手动取消。
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm text-zinc-500">
                    订单号
                  </p>

                  <h2 className="break-all text-2xl font-bold">
                    {getDisplayOrderNo(order)}
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-sm ${getStatusClassName(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="mb-8 rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="mb-2 text-sm text-zinc-500">
                  购买作品
                </p>

                <h3 className="mb-3 text-2xl font-bold">
                  {order.post.title}
                </h3>

                <p className="leading-7 text-zinc-400">
                  {order.post.excerpt}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 text-sm text-zinc-500">
                    购买用户
                  </p>

                  <p className="font-medium text-zinc-200">
                    {order.user.name}
                  </p>

                  <p className="mt-1 break-all text-sm text-zinc-500">
                    {order.user.email}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 text-sm text-zinc-500">
                    订单金额
                  </p>

                  <p className="text-3xl font-bold text-rose-100">
                    ¥{order.amount}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 text-sm text-zinc-500">
                    创建时间
                  </p>

                  <p className="text-zinc-200">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 text-sm text-zinc-500">
                    过期时间
                  </p>

                  <p className="text-zinc-200">
                    {order.expiresAt
                      ? formatDateTime(order.expiresAt)
                      : "无"}
                  </p>
                </div>

                {order.paidAt && (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:col-span-2">
                    <p className="mb-2 text-sm text-zinc-500">
                      支付时间
                    </p>

                    <p className="text-zinc-200">
                      {formatDateTime(order.paidAt)}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 lg:sticky lg:top-24">
              <h2 className="mb-4 text-2xl font-bold">
                订单操作
              </h2>

              {isPending && order.userId === user.id && (
                <div className="flex flex-col gap-4">
                  <p className="leading-7 text-zinc-400">
                    请在订单有效期内完成支付。超时后订单会自动取消，需要重新下单。
                  </p>

                  <PayOrderButton
                    orderId={order.id}
                    postId={order.post.id}
                    amount={order.amount}
                    expiresAt={order.expiresAt?.toISOString() ?? null}
                  />

                  <CancelOrderButton orderId={order.id} />
                </div>
              )}

              {isPaid && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-3xl border border-green-800 bg-green-900/20 p-5">
                    <h3 className="mb-2 text-xl font-bold text-green-200">
                      作品已解锁
                    </h3>

                    <p className="leading-7 text-zinc-400">
                      该订单已支付成功，你已经获得该作品的永久访问权限。
                    </p>
                  </div>

                  <Link
                    href={`/gallery/${order.post.id}`}
                    className="rounded-full bg-white px-5 py-3 text-center font-medium text-black hover:bg-rose-100 transition"
                  >
                    查看作品
                  </Link>
                </div>
              )}

              {isCancelled && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-3xl border border-red-800 bg-red-900/20 p-5">
                    <h3 className="mb-2 text-xl font-bold text-red-200">
                      订单已取消
                    </h3>

                    <p className="leading-7 text-zinc-400">
                      这个订单已经取消，不能继续支付。你可以回到作品详情页重新下单。
                    </p>
                  </div>

                  <Link
                    href={`/gallery/${order.post.id}`}
                    className="rounded-full bg-white px-5 py-3 text-center font-medium text-black hover:bg-rose-100 transition"
                  >
                    重新查看作品
                  </Link>
                </div>
              )}

              {isPending && order.userId !== user.id && user.role === "ADMIN" && (
                <div className="flex flex-col gap-4">
                  <p className="leading-7 text-zinc-400">
                    这是其他用户的待支付订单。管理员可以查看订单信息，但不能替用户模拟支付。
                  </p>

                  <CancelOrderButton orderId={order.id} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}