import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";

/**
 * 后台管理首页
 *
 * 作用：
 * - 管理员进入后台后的总览面板
 * - 显示内容、订单、购买权限、评论等关键数据
 * - 提供常用后台入口
 */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdminPage();

  // 进入后台时，顺手把已超时的待支付订单标记为已取消。
  // 这是轻量级兜底，不等于正式定时任务。
  await prisma.order.updateMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  const [
    totalPosts,
    workPosts,
    noticePosts,
    draftPosts,
    paidPosts,
    freePosts,
    totalOrders,
    pendingOrders,
    paidOrders,
    cancelledOrders,
    totalPurchases,
    totalComments,
    totalUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({
      where: {
        type: "WORK",
      },
    }),
    prisma.post.count({
      where: {
        type: "NOTICE",
      },
    }),
    prisma.post.count({
      where: {
        isPublished: false,
      },
    }),
    prisma.post.count({
      where: {
        isPaid: true,
      },
    }),
    prisma.post.count({
      where: {
        type: "WORK",
        isPaid: false,
      },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.order.count({
      where: {
        status: "PAID",
      },
    }),
    prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    }),
    prisma.purchase.count({
      where: {
        status: "PAID",
      },
    }),
    prisma.comment.count(),
    prisma.user.count(),
  ]);

  const statCards = [
    {
      label: "内容总数",
      value: totalPosts,
      detail: `作品 ${workPosts} / 公告 ${noticePosts}`,
    },
    {
      label: "付费作品",
      value: paidPosts,
      detail: `免费作品 ${freePosts}`,
    },
    {
      label: "草稿",
      value: draftPosts,
      detail: "未发布内容不会出现在前台",
    },
    {
      label: "订单总数",
      value: totalOrders,
      detail: `待支付 ${pendingOrders} / 已支付 ${paidOrders}`,
    },
    {
      label: "已取消订单",
      value: cancelledOrders,
      detail: "超时或手动取消的订单",
    },
    {
      label: "购买权限",
      value: totalPurchases,
      detail: "用户已解锁的作品数量",
    },
    {
      label: "评论数",
      value: totalComments,
      detail: "全站评论记录",
    },
    {
      label: "用户数",
      value: totalUsers,
      detail: "注册账号数量",
    },
  ];

  const managementLinks = [
    {
      href: "/dashboard/upload",
      title: "发布新内容",
      description: "发布作品帖、公告帖，设置免费/付费、草稿和置顶状态。",
      badge: "Create",
    },
    {
      href: "/dashboard/posts",
      title: "内容管理",
      description: "编辑、删除和查看所有作品、公告与草稿。",
      badge: "Posts",
    },
    {
      href: "/dashboard/orders",
      title: "订单管理",
      description: "查看待支付、已支付、已取消订单，以及订单号和支付状态。",
      badge: "Orders",
    },
    {
      href: "/dashboard/purchases",
      title: "购买权限",
      description: "查看用户已经解锁的付费作品记录。",
      badge: "Access",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回网站首页
            </Link>

            <Link
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              打开前台作品页
            </Link>
          </div>

          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-rose-300">
              Admin Console
            </p>

            <h1 className="mb-4 text-5xl font-black tracking-tight">
              后台管理
            </h1>

            <p className="max-w-2xl text-zinc-400">
              管理作品、公告、订单、购买权限和用户互动。这里是 AmekoRyTheater 的内容控制台。
            </p>
          </div>

          <section className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30"
              >
                <p className="mb-3 text-sm text-zinc-500">
                  {card.label}
                </p>

                <p className="text-4xl font-black">
                  {card.value}
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {card.detail}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
              <div className="mb-6">
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                  Management
                </p>

                <h2 className="text-3xl font-bold">
                  管理入口
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {managementLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-3xl border border-white/10 bg-black/30 p-6 transition hover:-translate-y-1 hover:border-rose-300/40 hover:bg-white/[0.06]"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                        {item.badge}
                      </span>

                      <span className="text-zinc-600 transition group-hover:text-rose-200">
                        →
                      </span>
                    </div>

                    <h3 className="mb-3 text-2xl font-bold group-hover:text-rose-100 transition">
                      {item.title}
                    </h3>

                    <p className="leading-7 text-zinc-400">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
                Status
              </p>

              <h2 className="mb-6 text-3xl font-bold">
                当前状态
              </h2>

              <div className="flex flex-col gap-4">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 font-bold text-white">
                    MVP 已完成
                  </p>

                  <p className="text-sm leading-6 text-zinc-400">
                    注册登录、付费内容、订单系统、评论系统、后台管理均已形成闭环。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 font-bold text-white">
                    当前阶段
                  </p>

                  <p className="text-sm leading-6 text-zinc-400">
                    正在进行 UI 美化与上线前整理。真实支付系统暂未接入。
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <p className="mb-2 font-bold text-white">
                    下一阶段
                  </p>

                  <p className="text-sm leading-6 text-zinc-400">
                    后台页面美化、需求路线整理、支付接入预研、部署准备。
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}