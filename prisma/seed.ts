import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  await prisma.post.createMany({
    data: [
      {
        title: "第一个作品帖子",
        excerpt: "这是首页展示的简短简介",
        content:
          "这里是帖子正文内容，以后可以写作品介绍、预览说明、更新日志等。",
        coverImage: "/images/test1.jpg",
        author: "AmekoRy",
        isPaid: false,
        price: 0,
      },
      {
        title: "第二个付费作品帖子",
        excerpt: "这是一个付费作品的简介",
        content:
          "这里以后会放付费作品说明，购买后可以显示下载链接或隐藏内容。",
        coverImage: "/images/test2.jpg",
        author: "AmekoRy",
        isPaid: true,
        price: 30,
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });