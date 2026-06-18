import type { Prisma, Purchase } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createAdminNotifications } from "@/lib/notifications";

const paidOrderInclude = {
  post: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

type PaidOrder = Prisma.OrderGetPayload<{
  include: typeof paidOrderInclude;
}>;

type FinalizePaidOrderInput = {
  orderId: number;
  actorUserId?: number;
  paymentType?: string | null;
  providerTradeNo?: string | null;
  paidAt?: Date;
  enforceExpiry?: boolean;
};

export type FinalizePaidOrderResult = {
  order: PaidOrder;
  purchase: Purchase | null;
  finalizedNow: boolean;
  alreadyPaid: boolean;
};

export class PaymentFlowError extends Error {
  status: number;
  order: PaidOrder | null;

  constructor(message: string, status = 400, order: PaidOrder | null = null) {
    super(message);
    this.name = "PaymentFlowError";
    this.status = status;
    this.order = order;
  }
}

/**
 * 支付成功统一收口。
 *
 * 当前由模拟支付入口调用；后续真实支付接入时，EPAY notify_url
 * 验签通过后也应该调用这里，而不是在回调里重新散写订单和权限逻辑。
 */
export async function finalizePaidOrder({
  orderId,
  actorUserId,
  paymentType,
  providerTradeNo,
  paidAt = new Date(),
  enforceExpiry = true,
}: FinalizePaidOrderInput): Promise<FinalizePaidOrderResult> {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: paidOrderInclude,
  });

  if (!order) {
    throw new PaymentFlowError("订单不存在", 404);
  }

  if (order.status === "PAID") {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: order.userId,
          postId: order.postId,
        },
      },
    });

    return {
      order,
      purchase,
      finalizedNow: false,
      alreadyPaid: true,
    };
  }

  if (order.status === "CANCELLED") {
    throw new PaymentFlowError("订单已取消，不能支付", 400, order);
  }

  if (enforceExpiry && order.expiresAt && order.expiresAt <= new Date()) {
    const cancelledOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
      },
      include: paidOrderInclude,
    });

    throw new PaymentFlowError(
      "订单已超时取消，请重新下单",
      400,
      cancelledOrder
    );
  }

  if (!order.post.isPaid) {
    throw new PaymentFlowError("免费作品不需要支付", 400, order);
  }

  const result = await prisma.$transaction(async (tx) => {
    const paidUpdate = await tx.order.updateMany({
      where: {
        id: order.id,
        status: "PENDING",
      },
      data: {
        status: "PAID",
        paidAt,
        providerTradeNo: providerTradeNo ?? order.providerTradeNo,
        paymentType: paymentType ?? order.paymentType,
      },
    });

    const latestOrder = await tx.order.findUniqueOrThrow({
      where: {
        id: order.id,
      },
      include: paidOrderInclude,
    });

    if (paidUpdate.count === 0) {
      if (latestOrder.status === "PAID") {
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_postId: {
              userId: latestOrder.userId,
              postId: latestOrder.postId,
            },
          },
        });

        return {
          order: latestOrder,
          purchase: existingPurchase,
          finalizedNow: false,
          alreadyPaid: true,
        };
      }

      throw new PaymentFlowError(
        "订单状态已变化，无法完成支付",
        400,
        latestOrder
      );
    }

    const purchase = await tx.purchase.upsert({
      where: {
        userId_postId: {
          userId: latestOrder.userId,
          postId: latestOrder.postId,
        },
      },
      create: {
        userId: latestOrder.userId,
        postId: latestOrder.postId,
        amountPaid: latestOrder.amount,
        status: "PAID",
      },
      update: {
        amountPaid: latestOrder.amount,
        status: "PAID",
      },
    });

    return {
      order: latestOrder,
      purchase,
      finalizedNow: true,
      alreadyPaid: false,
    };
  });

  if (result.finalizedNow) {
    try {
      await createAdminNotifications({
        actorUserId: actorUserId ?? result.order.userId,
        type: "POST_PURCHASED",
        title: "作品被购买了",
        content: `用户 ${result.order.user.name} 购买了《${result.order.post.title}》`,
        linkUrl: `/gallery/${result.order.postId}`,
      });
    } catch (error) {
      console.error("创建购买通知失败：", error);
    }
  }

  return result;
}
