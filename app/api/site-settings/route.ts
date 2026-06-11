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
      externalLinkText: toText(body.externalLinkText),
      externalLinkUrl: toText(body.externalLinkUrl),
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
    },
  });

  return NextResponse.json({
    success: true,
    setting,
  });
}