import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * 创建订单 API
 *
 * 路径：
 * POST /api/orders
 *
 * 当前作用：
 * 用户点击“购买作品”后，先创建一条待支付订单。
 *
 * 注意：
 * 这里不直接解锁作品。
 * 真正解锁要等订单支付成功后，由 /api/orders/[id]/pay 创建 Purchase。
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "请先登录后再购买",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const postId = Number(body.postId);

    if (Number.isNaN(postId)) {
      return Response.json(
        {
          success: false,
          message: "作品 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "作品不存在",
        },
        {
          status: 404,
        }
      );
    }

    if (!post.isPublished) {
      return Response.json(
        {
          success: false,
          message: "作品暂未发布，不能购买",
        },
        {
          status: 400,
        }
      );
    }

    if (!post.isPaid || post.price <= 0) {
      return Response.json(
        {
          success: false,
          message: "免费作品不需要购买",
        },
        {
          status: 400,
        }
      );
    }

    // 如果用户已经拥有这个作品，就不再创建订单。
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: post.id,
        },
      },
    });

    if (existingPurchase?.status === "PAID") {
      return Response.json(
        {
          success: false,
          message: "你已经购买过该作品",
        },
        {
          status: 400,
        }
      );
    }

    // 如果已经有待支付订单，就复用旧订单，避免重复创建一堆订单。
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: currentUser.id,
        postId: post.id,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPendingOrder) {
      return Response.json({
        success: true,
        message: "已有待支付订单",
        order: existingPendingOrder,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: currentUser.id,
        postId: post.id,

        // 记录下单时价格，后续即使作品价格变化，订单金额也不变。
        amount: post.price,
        status: "PENDING",
      },
    });

    return Response.json({
      success: true,
      message: "订单创建成功",
      order,
    });
  } catch (error) {
    console.error("创建订单失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器创建订单失败",
      },
      {
        status: 500,
      }
    );
  }
}