import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getExtension(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/gif") {
    return "gif";
  }

  return "";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "请先登录",
      },
      {
        status: 401,
      }
    );
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        message: "请选择头像图片",
      },
      {
        status: 400,
      }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      {
        success: false,
        message: "只能上传图片文件",
      },
      {
        status: 400,
      }
    );
  }

  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json(
      {
        success: false,
        message: "头像图片不能超过 3MB",
      },
      {
        status: 400,
      }
    );
  }

  const extension = getExtension(file.type);

  if (!extension) {
    return NextResponse.json(
      {
        success: false,
        message: "仅支持 png、jpg、webp、gif 格式",
      },
      {
        status: 400,
      }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

  await mkdir(uploadDir, {
    recursive: true,
  });

  const fileName = `avatar-${user.id}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const avatarUrl = `/uploads/avatars/${fileName}`;

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      avatarUrl,
    },
    select: {
      id: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({
    success: true,
    avatarUrl: updatedUser.avatarUrl,
  });
}