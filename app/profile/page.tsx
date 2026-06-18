import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PayOrderButton from "@/components/PayOrderButton";
import CancelOrderButton from "@/components/CancelOrderButton";

import { prisma } from "@/lib/prisma";
import { requireUserPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getDisplayOrderNo } from "@/lib/order";

export const dynamic = "force-dynamic";

/**
 * 用户个人中心页面
 *
 * 当前功能：
 * - 显示账号信息
 * - 显示订单记录
 * - 显示已购买作品
 * - 显示我的评论
 *
 * 页面定位：
 * 用户的“个人资产中心”。
 * 以后购买记录、订单记录、账号设置、下载入口都可以从这里进入。
 */
export default async function ProfilePage() {
  const user = await requireUserPage();

  // 进入个人中心时，顺手把当前用户已经超时的待支付订单标记为取消。
  // 这不是后台定时任务，只是一个轻量级兜底。
  await prisma.order.updateMany({
    where: {
      userId: user.id,
      status: "PENDING",
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  // 订单记录代表“购买流程”本身。
  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          excerpt: true,
          isPaid: true,
          price: true,
        },
      },
    },
  });

  // Purchase 表代表“已经获得访问权限”。
  const purchases = await prisma.purchase.findMany({
    where: {
      userId: user.id,
      status: "PAID",
    },
    orderBy: {
      createdAt: "desc",
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
    },
  });

  // 当前用户发表过的评论。
  const comments = await prisma.comment.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const unreadNotificationCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  const pendingOrderCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const paidOrderCount = orders.filter(
    (order) => order.status === "PAID"
  ).length;

  function getOrderStatusLabel(status: string) {
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

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              User Center
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              个人中心
            </h1>
            <AvatarUpload
              avatarUrl={user.avatarUrl}
              userName={user.name}
            />
            <p className="max-w-2xl text-zinc-400">
              查看你的账号信息、订单状态、已购买作品和评论记录。
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 lg:sticky lg:top-24">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-rose-300 via-fuchsia-400 to-amber-200 p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-2xl font-bold">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {user.name}
                  </h2>

                  <p className="text-sm text-zinc-500">
                    {user.role === "ADMIN" ? "管理员账号" : "普通用户"}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <div>
                  <p className="text-zinc-500">
                    邮箱
                  </p>
                  <p className="break-all text-zinc-200">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500">
                    角色
                  </p>
                  <p className="text-zinc-200">
                    {user.role === "ADMIN" ? "管理员" : "普通用户"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-2xl font-bold">
                    {purchases.length}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    已购买作品
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-2xl font-bold">
                    {orders.length}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    订单总数
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-2xl font-bold text-yellow-300">
                    {pendingOrderCount}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    待支付
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-2xl font-bold text-green-300">
                    {paidOrderCount}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    已支付
                  </p>
                </div>
              </div>

              <Link
                href="/profile/favorites"
                className="mt-4 block rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 transition hover:border-rose-300/40 hover:bg-rose-500/15"
              >
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-rose-300">
                  Favorites
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  我的收藏
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  查看收藏过的作品
                </p>
              </Link>

              <Link
                href="/profile/notifications"
                className="mt-3 block rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 transition hover:border-amber-300/40 hover:bg-amber-500/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-300">
                      Notifications
                    </p>

                    <p className="mt-2 text-lg font-bold text-white">
                      我的通知
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      查看评论回复通知
                    </p>
                  </div>

                  {unreadNotificationCount > 0 && (
                    <span className="rounded-full border border-amber-300/30 bg-amber-950/30 px-3 py-1 text-xs text-amber-100">
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
              </Link>
            </aside>

            <div className="flex flex-col gap-8">
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                      Orders
                    </p>

                    <h2 className="text-3xl font-bold">
                      我的订单
                    </h2>
                  </div>

                  <p className="text-sm text-zinc-500">
                    待支付订单会在超时后自动取消
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
                    <p className="text-zinc-400">
                      你还没有创建过订单。
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                      <article
                        key={order.id}
                        className="rounded-3xl border border-white/10 bg-black/30 p-5"
                      >
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="mb-2 text-xl font-bold">
                              {order.post.title}
                            </h3>

                            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                              {order.post.excerpt}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-3 py-1 text-sm ${getOrderStatusClassName(
                              order.status
                            )}`}
                          >
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="mb-5 grid gap-2 text-sm text-zinc-500 md:grid-cols-2">
                          <p>
                            订单号：{getDisplayOrderNo(order)}
                          </p>

                          <p>
                            金额：¥{order.amount}
                          </p>

                          <p>
                            创建时间：{formatDateTime(order.createdAt)}
                          </p>

                          {order.expiresAt && (
                            <p>
                              过期时间：{formatDateTime(order.expiresAt)}
                            </p>
                          )}

                          {order.paidAt && (
                            <p>
                              支付时间：{formatDateTime(order.paidAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {order.status === "PENDING" && (
                            <>
                              <PayOrderButton
                                orderId={order.id}
                                postId={order.post.id}
                                amount={order.amount}
                                expiresAt={order.expiresAt?.toISOString() ?? null}
                              />

                              <CancelOrderButton orderId={order.id} />
                            </>
                          )}

                          {order.status === "PAID" && (
                            <Link
                              href={`/gallery/${order.post.id}`}
                              className="rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-rose-100 transition"
                            >
                              查看作品
                            </Link>
                          )}

                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-zinc-300 hover:bg-white/10 hover:text-white transition"
                          >
                            查看订单
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Library
                  </p>

                  <h2 className="text-3xl font-bold">
                    已购买作品
                  </h2>
                </div>

                {purchases.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
                    <p className="text-zinc-400">
                      你还没有购买过作品。
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {purchases.map((purchase) => (
                      <article
                        key={purchase.id}
                        className="rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-rose-300/40 hover:bg-white/[0.05]"
                      >
                        <h3 className="mb-2 text-xl font-bold">
                          {purchase.post.title}
                        </h3>

                        <p className="mb-4 line-clamp-2 text-sm leading-6 text-zinc-400">
                          {purchase.post.excerpt}
                        </p>

                        <div className="mb-5 flex flex-col gap-1 text-sm text-zinc-500">
                          <p>
                            购买时间：{formatDateTime(purchase.createdAt)}
                          </p>

                          <p>
                            支付金额：¥{purchase.amountPaid}
                          </p>
                        </div>

                        <Link
                          href={`/gallery/${purchase.post.id}`}
                          className="inline-block rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-rose-100 transition"
                        >
                          查看作品
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
                <div className="mb-6">
                  <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                    Comments
                  </p>

                  <h2 className="text-3xl font-bold">
                    我的评论
                  </h2>
                </div>

                {comments.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
                    <p className="text-zinc-400">
                      你还没有发表过评论。
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {comments.map((comment) => (
                      <article
                        key={comment.id}
                        className="rounded-3xl border border-white/10 bg-black/30 p-5"
                      >
                        <p className="mb-3 leading-7 text-zinc-300">
                          {comment.content}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
                          <span>
                            发布于：{formatDateTime(comment.createdAt)}
                          </span>

                          <Link
                            href={`/gallery/${comment.post.id}`}
                            className="text-zinc-400 underline hover:text-white transition"
                          >
                            查看帖子：《{comment.post.title}》
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
