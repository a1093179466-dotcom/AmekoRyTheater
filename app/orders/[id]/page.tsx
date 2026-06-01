import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUserPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import PayOrderButton from "@/components/PayOrderButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

/**
 * 订单确认页
 *
 * 路径：
 * /orders/[id]
 *
 * 当前作用：
 * - 显示订单信息
 * - 提供“模拟支付完成”按钮
 *
 * 以后接真实支付时：
 * 这里可以替换成真实支付按钮或二维码。
 */
export default async function OrderDetailPage({ params }: PageProps) {
  const user = await requireUserPage();

  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          订单不存在
        </h1>

        <p className="text-zinc-400">
          无效的订单 ID：{id}
        </p>
      </main>
    );
  }

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
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          订单不存在
        </h1>

        <Link
          href="/profile"
          className="text-zinc-400 hover:text-white underline"
        >
          返回个人中心
        </Link>
      </main>
    );
  }

  // 普通用户只能看自己的订单。
  // 管理员可以查看所有订单，方便后台排查。
  if (order.userId !== user.id && user.role !== "ADMIN") {
    redirect("/");
  }

  const statusLabel =
    order.status === "PAID"
      ? "已支付"
      : order.status === "CANCELLED"
        ? "已取消"
        : "待支付";

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/gallery/${order.post.id}`}
            className="text-zinc-400 hover:text-white underline"
          >
            ← 返回作品详情
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">
          订单确认
        </h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            作品信息
          </h2>

          <h3 className="text-xl font-bold mb-2">
            {order.post.title}
          </h3>

          <p className="text-zinc-400">
            {order.post.excerpt}
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            订单信息
          </h2>

          <div className="flex flex-col gap-2 text-zinc-300">
            <p>订单号：{order.id}</p>
            <p>购买用户：{order.user.name}（{order.user.email}）</p>
            <p>订单金额：¥{order.amount}</p>
            <p>订单状态：{statusLabel}</p>
            <p>创建时间：{formatDateTime(order.createdAt)}</p>

            {order.paidAt && (
              <p>
                支付时间：{formatDateTime(order.paidAt)}
              </p>
            )}
          </div>
        </section>

        {order.status === "PENDING" && order.userId === user.id && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              模拟支付
            </h2>

            <p className="text-zinc-400 mb-4">
              当前阶段还没有接入真实支付。点击下面按钮会模拟支付成功，并解锁该作品。
            </p>

            <PayOrderButton
              orderId={order.id}
              postId={order.post.id}
              amount={order.amount}
            />
          </section>
        )}

        {order.status === "PAID" && (
          <section className="bg-green-900/30 border border-green-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              作品已解锁
            </h2>

            <Link
              href={`/gallery/${order.post.id}`}
              className="inline-block bg-white text-black px-5 py-3 rounded-xl hover:bg-zinc-300 transition"
            >
              查看作品
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}