import { getCurrentUser } from "@/lib/auth";
import { finalizePaidOrder, PaymentFlowError } from "@/lib/payment";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 模拟支付 API。
 *
 * 当前仍然不接真实支付，只把“支付成功后的收口动作”集中到
 * finalizePaidOrder，方便后续 EPAY notify_url 验签成功后复用。
 */
export async function POST(_request: Request, context: RouteContext) {
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
      select: {
        id: true,
        userId: true,
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

    const result = await finalizePaidOrder({
      orderId: order.id,
      actorUserId: currentUser.id,
      paymentType: "SIMULATED",
      providerTradeNo: `simulated_${order.id}_${Date.now()}`,
    });

    return Response.json({
      success: true,
      message: result.alreadyPaid
        ? "订单已经支付过"
        : "模拟支付成功，作品已解锁",
      order: result.order,
      purchase: result.purchase,
    });
  } catch (error) {
    if (error instanceof PaymentFlowError) {
      return Response.json(
        {
          success: false,
          message: error.message,
          order: error.order,
        },
        {
          status: error.status,
        }
      );
    }

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
