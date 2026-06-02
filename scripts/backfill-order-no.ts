import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateOrderNo } from "@/lib/order";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * 给旧订单补充 orderNo。
 *
 * 旧订单是在 orderNo 字段出现之前创建的，
 * 所以 orderNo 为空，页面会显示 LEGACY-订单ID。
 *
 * 运行这个脚本后，所有旧订单都会获得正式订单号。
 */
async function main() {
  const legacyOrders = await prisma.order.findMany({
    where: {
      orderNo: null,
    },
    select: {
      id: true,
    },
  });

  console.log(`发现 ${legacyOrders.length} 条旧订单需要补订单号。`);

  for (const order of legacyOrders) {
    const orderNo = generateOrderNo();

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        orderNo,
      },
    });

    console.log(`订单 ${order.id} 已补充订单号：${orderNo}`);
  }

  console.log("旧订单号补全完成。");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("补全订单号失败：", error);
    await prisma.$disconnect();
    process.exit(1);
  });