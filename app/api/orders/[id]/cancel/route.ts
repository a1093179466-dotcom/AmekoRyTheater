import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * 取消订单 API
 *
 * 路径：
 * POST /api/orders/[id]/cancel
 *
 * 权限规则：
 * 1. 未登录不能取消
 * 2. 订单所属用户可以取消自己的待支付订单
 * 3. 管理员可以取消任意待支付订单
 * 4. 已支付订单不能直接取消，后续应走退款流程
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

    const isOwner = order.userId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return Response.json(
        {
          success: false,
          message: "没有权限取消这个订单",
        },
        {
          status: 403,
        }
      );
    }

    if (order.status === "PAID") {
      return Response.json(
        {
          success: false,
          message: "已支付订单不能直接取消，后续请走退款流程",
        },
        {
          status: 400,
        }
      );
    }

    if (order.status === "CANCELLED") {
      return Response.json({
        success: true,
        message: "订单已经取消",
        order,
      });
    }

    const cancelledOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return Response.json({
      success: true,
      message: "订单已取消",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("取消订单失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器取消订单失败",
      },
      {
        status: 500,
      }
    );
  }
}