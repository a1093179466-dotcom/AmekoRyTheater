import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth";
import DashboardBackLink from "@/components/DashboardBackLink";

export const dynamic = "force-dynamic";

/**
 * 后台购买记录管理页面。
 *
 * 作用：
 * 管理员查看所有用户的购买记录。
 *
 * 目前阶段：
 * - 购买记录来自模拟购买
 * - status = PAID 表示已经获得访问权限
 *
 * 以后接真实支付时：
 * - PENDING 可以表示待支付
 * - PAID 表示支付成功
 * - REFUNDED 表示已退款
 */
export default async function DashboardPurchasesPage() {
  // 后台页面必须先检查管理员权限。
  // 普通用户即使手动输入网址，也不能访问。
  await requireAdminPage();

  // 查询所有购买记录。
  // include.user：顺便查出购买者信息。
  // include.post：顺便查出被购买的作品信息。
  const purchases = await prisma.purchase.findMany({
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

  /**
   * 把数据库里的英文状态转换成界面上更好理解的中文。
   */
  function getStatusLabel(status: string) {
    if (status === "PAID") {
      return "已支付";
    }

    if (status === "PENDING") {
      return "待支付";
    }

    if (status === "REFUNDED") {
      return "已退款";
    }

    return status;
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <DashboardBackLink />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          购买记录管理
        </h1>

        <Link
          href="/dashboard/posts"
          className="bg-zinc-800 px-5 py-3 rounded-xl hover:bg-zinc-700 transition"
        >
          返回帖子管理
        </Link>
      </div>

      {purchases.length === 0 ? (
        <p className="text-zinc-400">
          目前还没有购买记录。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {purchases.map((purchase) => (
            <article
              key={purchase.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">
                    {purchase.post.title}
                  </h2>

                  <span className="bg-zinc-800 px-3 py-1 rounded-full text-sm text-zinc-300">
                    {getStatusLabel(purchase.status)}
                  </span>
                </div>

                <div className="text-zinc-400 text-sm flex flex-col gap-1">
                  <p>
                    购买用户：{purchase.user.name}（{purchase.user.email}）
                  </p>

                  <p>
                    用户 ID：{purchase.user.id}
                  </p>

                  <p>
                    作品 ID：{purchase.post.id}
                  </p>

                  <p>
                    支付金额：¥{purchase.amountPaid}
                  </p>

                  <p>
                    购买时间：{purchase.createdAt.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3 mt-3">
                  <Link
                    href={`/gallery/${purchase.post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
                  >
                    查看作品
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}