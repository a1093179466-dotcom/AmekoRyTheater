import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import DashboardBackLink from "@/components/DashboardBackLink";

export const dynamic = "force-dynamic";

/**
 * 后台订单管理页面。
 *
 * Order 表代表“支付流程记录”：
 * - PENDING：用户创建了订单，但还没支付
 * - PAID：订单已经支付成功
 * - CANCELLED：订单超时或被取消
 *
 * Purchase 表代表“用户已经获得作品访问权限”。
 *
 * 所以：
 * - /dashboard/orders 看订单过程
 * - /dashboard/purchases 看最终解锁结果
 */
export default async function DashboardOrdersPage() {
  // 后台页面必须检查管理员权限。
  await requireAdminPage();

  // 进入后台订单页时，顺手把已经超时的待支付订单标记为取消。
  // 这不是后台定时任务，只是一个轻量级兜底。
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

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          price: true,
          isPaid: true,
        },
      },
    },
  });

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
      return "bg-yellow-900/40 text-yellow-300 border-yellow-800";
    }

    if (status === "PAID") {
      return "bg-green-900/40 text-green-300 border-green-800";
    }

    if (status === "CANCELLED") {
      return "bg-red-900/40 text-red-300 border-red-800";
    }

    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          订单管理
        </h1>

        <Link
          href="/dashboard/purchases"
          className="bg-zinc-800 px-5 py-3 rounded-xl hover:bg-zinc-700 transition"
        >
          查看购买权限
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-400">
          目前还没有订单。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {order.post.title}
                  </h2>

                  <p className="text-sm text-zinc-500">
                    订单号：{order.id}
                  </p>
                </div>

                <span
                  className={`border px-3 py-1 rounded-full text-sm ${getOrderStatusClassName(
                    order.status
                  )}`}
                >
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              <div className="text-zinc-400 text-sm flex flex-col gap-1 mb-4">
                <p>
                  购买用户：{order.user.name}（{order.user.email}）
                </p>

                <p>
                  用户 ID：{order.user.id}
                </p>

                <p>
                  作品 ID：{order.post.id}
                </p>

                <p>
                  订单金额：¥{order.amount}
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

              <div className="flex gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                >
                  查看订单
                </Link>

                <Link
                  href={`/gallery/${order.post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                >
                  查看作品
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}