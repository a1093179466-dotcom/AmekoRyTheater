import { prisma } from "@/lib/prisma";

/**
 * 获取站点设置。
 *
 * 全站只有一条配置记录，固定 id = 1。
 * 如果不存在，就自动创建默认配置。
 */
export async function getSiteSetting() {
  const setting = await prisma.siteSetting.findUnique({
    where: {
      id: 1,
    },
  });

  if (setting) {
    return setting;
  }

  return prisma.siteSetting.create({
    data: {
      id: 1,
    },
  });
}