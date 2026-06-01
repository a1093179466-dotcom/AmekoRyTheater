import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 模拟支付 API
 *
 * 路径：
 * POST /api/orders/[id]/pay
 *
 * 当前阶段：
 * 点击“模拟支付完成”后：
 * 1. 把 Order 状态改成 PAID
 * 2. 创建或更新 Purchase
 * 3. 用户获得该作品的永久访问权限
 *
 * 以后接真实支付时：
 * 这个接口会被真实支付平台的回调逻辑替代。
 */
export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "请先登录",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;
    const orderId = Number(id);

    if (Number.isNaN(orderId)) {
      return Response.json(
        {
          success: false,
          message: "订单 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        post: true,
      },
    });

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "订单不存在",
        },
        {
          status: 404,
        }
      );
    }

    // 只有订单所属用户可以支付自己的订单。
    if (order.userId !== currentUser.id) {
      return Response.json(
        {
          success: false,
          message: "没有权限支付这个订单",
        },
        {
          status: 403,
        }
      );
    }

    if (order.status === "PAID") {
      return Response.json({
        success: true,
        message: "订单已经支付过",
        order,
      });
    }

    if (order.status === "CANCELLED") {
      return Response.json(
        {
          success: false,
          message: "订单已取消，不能支付",
        },
        {
          status: 400,
        }
      );
    }

    if (!order.post.isPaid) {
      return Response.json(
        {
          success: false,
          message: "免费作品不需要支付",
        },
        {
          status: 400,
        }
      );
    }

    const paidAt = new Date();

    // 使用事务保证：
    // 订单支付成功 和 购买权限创建 要么一起成功，要么一起失败。
    const paidOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAID",
          paidAt,
        },
      });

      await tx.purchase.upsert({
        where: {
          userId_postId: {
            userId: order.userId,
            postId: order.postId,
          },
        },
        create: {
          userId: order.userId,
          postId: order.postId,
          amountPaid: order.amount,
          status: "PAID",
        },
        update: {
          amountPaid: order.amount,
          status: "PAID",
        },
      });

      return updatedOrder;
    });

    return Response.json({
      success: true,
      message: "模拟支付成功，作品已解锁",
      order: paidOrder,
    });
  } catch (error) {
    console.error("模拟支付失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器模拟支付失败",
      },
      {
        status: 500,
      }
    );
  }
}