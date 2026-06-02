import Link from "next/link";
import { getDisplayOrderNo } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { requireUserPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import PayOrderButton from "@/components/PayOrderButton";

export const dynamic = "force-dynamic";

/**
 * 用户个人中心页面
 *
 * 当前功能：
 * - 显示账号信息
 * - 显示订单记录
 * - 显示已购买作品
 * - 显示我的评论
 */
export default async function ProfilePage() {
  // 个人中心必须登录才能访问。
  // 如果没登录，requireUserPage 会自动跳转到 /login。
  const user = await requireUserPage();

  // 查询当前用户的订单记录。
  // 订单记录代表“购买流程”本身：
  // - PENDING：待支付
  // - PAID：已支付
  // - CANCELLED：已取消
  // 进入个人中心时，自动取消当前用户已经超时的待支付订单
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

  // 查询当前用户已经购买过的作品。
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

  // 查询当前用户发表过的评论。
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

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white underline transition"
        >
          ← 返回首页
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">
        个人中心
      </h1>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          账号信息
        </h2>

        <div className="flex flex-col gap-2 text-zinc-300">
          <p>
            昵称：{user.name}
          </p>

          <p>
            邮箱：{user.email}
          </p>

          <p>
            角色：{user.role === "ADMIN" ? "管理员" : "普通用户"}
          </p>
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          我的订单
        </h2>

        {orders.length === 0 ? (
          <p className="text-zinc-400">
            你还没有创建过订单。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="border-b border-zinc-700 pb-4"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {order.post.title}
                    </h3>

                    <p className="text-zinc-400 mb-2">
                      {order.post.excerpt}
                    </p>
                  </div>

                  <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm text-zinc-300">
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="text-sm text-zinc-500 flex flex-col gap-1 mb-4">
                  <p>
                    订单号：{getDisplayOrderNo(order)}
                  </p>

                  <p>
                    订单金额：¥{order.amount}
                  </p>

                  <p>
                    创建时间：{formatDateTime(order.createdAt)}
                  </p>

                  {order.paidAt && (
                    <p>
                      支付时间：{formatDateTime(order.paidAt)}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {order.status === "PENDING" && (
                    <PayOrderButton
                      orderId={order.id}
                      postId={order.post.id}
                      amount={order.amount}
                      expiresAt={order.expiresAt?.toISOString() ?? null}
                    />
                  )}

                  {order.status === "PAID" && (
                    <Link
                      href={`/gallery/${order.post.id}`}
                      className="inline-block bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-300 transition"
                    >
                      查看作品
                    </Link>
                  )}

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-block bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                  >
                    查看订单
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          已购买作品
        </h2>

        {purchases.length === 0 ? (
          <p className="text-zinc-400">
            你还没有购买过作品。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {purchases.map((purchase) => (
              <article
                key={purchase.id}
                className="border-b border-zinc-700 pb-4"
              >
                <h3 className="text-xl font-bold mb-2">
                  {purchase.post.title}
                </h3>

                <p className="text-zinc-400 mb-2">
                  {purchase.post.excerpt}
                </p>

                <p className="text-sm text-zinc-500 mb-2">
                  购买时间：{formatDateTime(purchase.createdAt)}
                </p>

                <p className="text-sm text-zinc-500 mb-3">
                  支付金额：¥{purchase.amountPaid}
                </p>

                <Link
                  href={`/gallery/${purchase.post.id}`}
                  className="inline-block bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-300 transition"
                >
                  查看作品
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">
          我的评论
        </h2>

        {comments.length === 0 ? (
          <p className="text-zinc-400">
            你还没有发表过评论。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="border-b border-zinc-700 pb-4"
              >
                <p className="text-zinc-300 mb-2">
                  {comment.content}
                </p>

                <p className="text-sm text-zinc-500 mb-2">
                  发布于：{formatDateTime(comment.createdAt)}
                </p>

                <Link
                  href={`/gallery/${comment.post.id}`}
                  className="text-sm text-zinc-400 hover:text-white underline transition"
                >
                  查看帖子：《{comment.post.title}》
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}