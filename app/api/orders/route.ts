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
 * 订单规则：
 * 1. 已购买作品，不再创建订单
 * 2. 只复用“未过期的待支付订单”
 * 3. 已取消订单不会复用
 * 4. 已过期待支付订单会先自动改成 CANCELLED
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

    const now = new Date();

    /**
     * 关键修复：
     *
     * 在创建新订单之前，先把当前用户对当前作品的
     * 所有“已经过期的待支付订单”改成 CANCELLED。
     *
     * 这样后面查找待支付订单时，就不会复用旧的过期订单。
     */
    await prisma.order.updateMany({
      where: {
        userId: currentUser.id,
        postId: post.id,
        status: "PENDING",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    /**
     * 只复用仍然有效的待支付订单。
     *
     * 注意：
     * - status 必须是 PENDING
     * - expiresAt 必须大于当前时间
     *
     * CANCELLED 订单不会被复用。
     */
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: currentUser.id,
        postId: post.id,
        status: "PENDING",
        expiresAt: {
          gt: now,
        },
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

    // 订单有效期：2 分钟
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    /**
     * 创建新的待支付订单。
     *
     * 注意：
     * amount 保存的是下单时的价格快照。
     * 以后作品价格变化，不影响已有订单金额。
     */
    const order = await prisma.order.create({
      data: {
        userId: currentUser.id,
        postId: post.id,
        amount: post.price,
        status: "PENDING",
        expiresAt,
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