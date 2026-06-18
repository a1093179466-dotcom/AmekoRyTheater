import { NextResponse } from "next/server";

import { isCurrentUserAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploadFile";

export const runtime = "nodejs";

const SETTING_FIELDS = [
  "siteTitle",
  "siteSubtitle",
  "homeHeroTitle",
  "homeHeroSubtitle",
  "homeBackgroundImage",
  "homeHeroImage",
  "tickerEnabled",
  "tickerText",
  "aboutText",
  "contactEmail",
  "externalLinkText",
  "externalLinkUrl",
  "youtubeEnabled",
  "youtubeUrl",
  "xEnabled",
  "xUrl",
  "pixivEnabled",
  "pixivUrl",
] as const;

type SettingField = (typeof SETTING_FIELDS)[number];
type ParsedSettingsRequest = {
  body: Partial<Record<SettingField, unknown>>;
  homeBackgroundImageFile: File | null;
  homeHeroImageFile: File | null;
};

function toText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function hasField(
  body: Partial<Record<SettingField, unknown>>,
  field: SettingField
) {
  return Object.prototype.hasOwnProperty.call(body, field);
}

async function parseSettingsRequest(
  request: Request
): Promise<ParsedSettingsRequest> {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    const jsonBody = await request.json();

    return {
      body:
        jsonBody && typeof jsonBody === "object" && !Array.isArray(jsonBody)
          ? (jsonBody as Partial<Record<SettingField, unknown>>)
          : {},
      homeBackgroundImageFile: null,
      homeHeroImageFile: null,
    };
  }

  const formData = await request.formData();
  const body: Partial<Record<SettingField, unknown>> = {};

  for (const field of SETTING_FIELDS) {
    const value = formData.get(field);

    if (typeof value === "string") {
      body[field] = value;
    }
  }

  const homeBackgroundImageFile = formData.get("homeBackgroundImageFile");
  const homeHeroImageFile = formData.get("homeHeroImageFile");

  return {
    body,
    homeBackgroundImageFile:
      homeBackgroundImageFile instanceof File &&
      homeBackgroundImageFile.size > 0
        ? homeBackgroundImageFile
        : null,
    homeHeroImageFile:
      homeHeroImageFile instanceof File && homeHeroImageFile.size > 0
        ? homeHeroImageFile
        : null,
  };
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

  let parsedRequest: ParsedSettingsRequest;

  try {
    parsedRequest = await parseSettingsRequest(request);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "站点设置数据格式不正确",
      },
      {
        status: 400,
      }
    );
  }

  const { body, homeBackgroundImageFile, homeHeroImageFile } = parsedRequest;

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

  const tickerEnabled = toBoolean(body.tickerEnabled);
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

  const oldSetting = await prisma.siteSetting.findUnique({
    where: {
      id: 1,
    },
  });

  let homeBackgroundImage = hasField(body, "homeBackgroundImage")
    ? toText(body.homeBackgroundImage)
    : oldSetting?.homeBackgroundImage ?? "";

  let homeHeroImage = hasField(body, "homeHeroImage")
    ? toText(body.homeHeroImage)
    : oldSetting?.homeHeroImage ?? "";

  if (homeBackgroundImageFile) {
    try {
      homeBackgroundImage = await saveUploadedImage(
        homeBackgroundImageFile,
        "site-settings"
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? `首页背景图上传失败：${error.message}`
              : "首页背景图上传失败",
        },
        {
          status: 400,
        }
      );
    }
  }

  if (homeHeroImageFile) {
    try {
      homeHeroImage = await saveUploadedImage(
        homeHeroImageFile,
        "site-settings"
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? `首页 Hero 图上传失败：${error.message}`
              : "首页 Hero 图上传失败",
        },
        {
          status: 400,
        }
      );
    }
  }

  const settingData = {
    siteTitle,
    siteSubtitle: toText(body.siteSubtitle),

    homeHeroTitle,
    homeHeroSubtitle: toText(body.homeHeroSubtitle),
    homeBackgroundImage,
    homeHeroImage,

    tickerEnabled,
    tickerText,

    aboutText: toText(body.aboutText),
    contactEmail: toText(body.contactEmail),

    // 旧的单个外部链接字段保留，避免影响已有数据和页面读取。
    externalLinkText: toText(body.externalLinkText),
    externalLinkUrl: toText(body.externalLinkUrl),

    youtubeEnabled: toBoolean(body.youtubeEnabled),
    youtubeUrl: toText(body.youtubeUrl),

    xEnabled: toBoolean(body.xEnabled),
    xUrl: toText(body.xUrl),

    pixivEnabled: toBoolean(body.pixivEnabled),
    pixivUrl: toText(body.pixivUrl),
  };

  const setting = await prisma.siteSetting.upsert({
    where: {
      id: 1,
    },
    update: settingData,
    create: {
      id: 1,
      ...settingData,
    },
  });

  return NextResponse.json({
    success: true,
    setting,
  });
}
