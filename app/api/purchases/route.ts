import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * 创建买断权限 API
 *
 * 当前阶段：
 * - 这是“模拟购买”
 * - 用户点击购买后，直接创建 PAID 购买记录
 *
 * 以后接真实支付时：
 * - 这里会改成创建订单
 * - 等支付平台回调成功后，再把状态改成 PAID
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // 必须登录才能购买
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
          message: "帖子 ID 无效",
        },
        {
          status: 400,
        }
      );
    }

    // 查询要购买的帖子
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return Response.json(
        {
          success: false,
          message: "帖子不存在",
        },
        {
          status: 404,
        }
      );
    }

    // 免费作品不需要购买
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

    // 如果已经购买过，就直接返回已有购买记录
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: post.id,
        },
      },
    });

    if (existingPurchase) {
      return Response.json({
        success: true,
        message: "你已经购买过该作品",
        purchase: existingPurchase,
      });
    }

    // 当前阶段直接创建 PAID 购买记录
    const purchase = await prisma.purchase.create({
      data: {
        userId: currentUser.id,
        postId: post.id,
        amountPaid: post.price,
        status: "PAID",
      },
    });

    return Response.json({
      success: true,
      message: "购买成功",
      purchase,
    });
  } catch (error) {
    console.error("购买失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器购买失败",
      },
      {
        status: 500,
      }
    );
  }
}