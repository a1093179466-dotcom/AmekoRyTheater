import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

/**
 * 保存上传图片到 public/uploads 下。
 *
 * 返回值是浏览器可访问的路径，例如：
 * /uploads/posts/xxx.jpg
 */
export async function saveUploadedImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("图片不能超过 8MB");
  }

  const extension = getExtension(file.type);

  if (!extension) {
    throw new Error("仅支持 png、jpg、webp、gif 格式");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await mkdir(uploadDir, {
    recursive: true,
  });

  const fileName = `${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}