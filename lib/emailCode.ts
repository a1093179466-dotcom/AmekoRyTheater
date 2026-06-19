import { randomInt } from "crypto";

import { prisma } from "@/lib/prisma";

export const EMAIL_CODE_PURPOSES = ["REGISTER", "RESET_PASSWORD"] as const;

export type EmailCodePurpose = (typeof EMAIL_CODE_PURPOSES)[number];

type CreateEmailVerificationCodeParams = {
  email: string;
  purpose: EmailCodePurpose;
  length?: number;
  expiresInMinutes?: number;
};

type VerifyEmailCodeParams = {
  email: string;
  purpose: EmailCodePurpose;
  code: string;
};

type FindRecentEmailVerificationCodeParams = {
  email: string;
  purpose: EmailCodePurpose;
  since: Date;
};

export type VerifyEmailCodeResult =
  | {
      success: true;
      message: string;
      codeId: number;
    }
  | {
      success: false;
      reason: "NOT_FOUND" | "EXPIRED" | "CONSUMED";
      message: string;
    };

export function isEmailCodePurpose(value: string): value is EmailCodePurpose {
  return EMAIL_CODE_PURPOSES.includes(value as EmailCodePurpose);
}

export function generateNumericCode(length = 6) {
  const safeLength = Math.max(1, Math.floor(length));

  let code = "";

  for (let index = 0; index < safeLength; index += 1) {
    code += String(randomInt(0, 10));
  }

  return code;
}

export async function findRecentEmailVerificationCode({
  email,
  purpose,
  since,
}: FindRecentEmailVerificationCodeParams) {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.emailVerificationCode.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}

export async function createEmailVerificationCode({
  email,
  purpose,
  length = 6,
  expiresInMinutes = 10,
}: CreateEmailVerificationCodeParams) {
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.emailVerificationCode.deleteMany({
    where: {
      email: normalizedEmail,
      purpose,
      consumedAt: null,
    },
  });

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  return prisma.emailVerificationCode.create({
    data: {
      email: normalizedEmail,
      purpose,
      code: generateNumericCode(length),
      expiresAt,
    },
  });
}

export async function verifyEmailCode({
  email,
  purpose,
  code,
}: VerifyEmailCodeParams): Promise<VerifyEmailCodeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();

  const verificationCode = await prisma.emailVerificationCode.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      code: normalizedCode,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verificationCode) {
    return {
      success: false,
      reason: "NOT_FOUND",
      message: "验证码无效",
    };
  }

  if (verificationCode.consumedAt) {
    return {
      success: false,
      reason: "CONSUMED",
      message: "验证码已使用",
    };
  }

  if (verificationCode.expiresAt < new Date()) {
    return {
      success: false,
      reason: "EXPIRED",
      message: "验证码已过期",
    };
  }

  // 用 updateMany 再检查一次 consumedAt，避免并发请求重复消费同一个验证码。
  const consumeResult = await prisma.emailVerificationCode.updateMany({
    where: {
      id: verificationCode.id,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  if (consumeResult.count === 0) {
    return {
      success: false,
      reason: "CONSUMED",
      message: "验证码已使用",
    };
  }

  return {
    success: true,
    message: "验证码校验成功",
    codeId: verificationCode.id,
  };
}
