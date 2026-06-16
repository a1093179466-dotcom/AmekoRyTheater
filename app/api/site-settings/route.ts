import { NextResponse } from "next/server";

import { isCurrentUserAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function PATCH(request: Request) {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: "没有权限",
      },
      {
        status: 403,
      }
    );
  }

  const body = await request.json();

  const siteTitle = toText(body.siteTitle);
  const homeHeroTitle = toText(body.homeHeroTitle);

  if (!siteTitle) {
    return NextResponse.json(
      {
        success: false,
        message: "站点标题不能为空",
      },
      {
        status: 400,
      }
    );
  }

  if (!homeHeroTitle) {
    return NextResponse.json(
      {
        success: false,
        message: "首页主标题不能为空",
      },
      {
        status: 400,
      }
    );
  }

  const tickerEnabled = Boolean(body.tickerEnabled);
  const tickerText = toText(body.tickerText);

  if (tickerEnabled && !tickerText) {
    return NextResponse.json(
      {
        success: false,
        message: "开启滚动公告时，公告内容不能为空",
      },
      {
        status: 400,
      }
    );
  }

  const setting = await prisma.siteSetting.upsert({
    where: {
      id: 1,
    },
    update: {
      siteTitle,
      siteSubtitle: toText(body.siteSubtitle),

      homeHeroTitle,
      homeHeroSubtitle: toText(body.homeHeroSubtitle),

      tickerEnabled,
      tickerText,

      aboutText: toText(body.aboutText),
      contactEmail: toText(body.contactEmail),

      // 旧的单个外部链接字段，先保留，避免影响已有代码和数据
      externalLinkText: toText(body.externalLinkText),
      externalLinkUrl: toText(body.externalLinkUrl),

      // 新的平台图标链接
      youtubeEnabled: Boolean(body.youtubeEnabled),
      youtubeUrl: toText(body.youtubeUrl),

      xEnabled: Boolean(body.xEnabled),
      xUrl: toText(body.xUrl),

      pixivEnabled: Boolean(body.pixivEnabled),
      pixivUrl: toText(body.pixivUrl),
    },
    create: {
      id: 1,

      siteTitle,
      siteSubtitle: toText(body.siteSubtitle),

      homeHeroTitle,
      homeHeroSubtitle: toText(body.homeHeroSubtitle),

      tickerEnabled,
      tickerText,

      aboutText: toText(body.aboutText),
      contactEmail: toText(body.contactEmail),

      externalLinkText: toText(body.externalLinkText),
      externalLinkUrl: toText(body.externalLinkUrl),

      youtubeEnabled: Boolean(body.youtubeEnabled),
      youtubeUrl: toText(body.youtubeUrl),

      xEnabled: Boolean(body.xEnabled),
      xUrl: toText(body.xUrl),

      pixivEnabled: Boolean(body.pixivEnabled),
      pixivUrl: toText(body.pixivUrl),
    },
  });

  return NextResponse.json({
    success: true,
    setting,
  });
}