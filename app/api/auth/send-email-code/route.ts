import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  createEmailVerificationCode,
  findRecentEmailVerificationCode,
  isEmailCodePurpose,
} from "@/lib/emailCode";

export const runtime = "nodejs";

const RESET_PASSWORD_MESSAGE =
  "如果邮箱存在，我们会发送验证码，请稍后查看邮箱";
const EMAIL_CODE_SEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_CODE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_CODE_RATE_LIMIT_MAX_REQUESTS = 10;
const EMAIL_CODE_IP_RATE_LIMIT_MAX_REQUESTS = 40;

const TOO_MANY_REQUESTS_MESSAGE =
  "验证码请求过于频繁，请稍后再试";

type RateLimitStore = Map<string, number[]>;

type GlobalWithEmailCodeRateLimit = typeof globalThis & {
  __amekoEmailCodeRateLimit?: RateLimitStore;
};

const globalWithEmailCodeRateLimit =
  globalThis as GlobalWithEmailCodeRateLimit;

const emailCodeRateLimitStore =
  globalWithEmailCodeRateLimit.__amekoEmailCodeRateLimit ?? new Map();

globalWithEmailCodeRateLimit.__amekoEmailCodeRateLimit =
  emailCodeRateLimitStore;

function buildEmailContent({
  code,
  purpose,
}: {
  code: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}) {
  if (purpose === "REGISTER") {
    return {
      subject: "注册验证码",
      text: `你的注册验证码是：${code}。验证码 10 分钟内有效，请勿泄露给他人。`,
      html: `<p>你的注册验证码是：<strong>${code}</strong></p><p>验证码 10 分钟内有效，请勿泄露给他人。</p>`,
    };
  }

  return {
    subject: "找回密码验证码",
    text: `你的找回密码验证码是：${code}。验证码 10 分钟内有效，请勿泄露给他人。`,
    html: `<p>你的找回密码验证码是：<strong>${code}</strong></p><p>验证码 10 分钟内有效，请勿泄露给他人。</p>`,
  };
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function takeRateLimitSlot({
  key,
  limit,
  windowMs,
  nowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs: number;
}) {
  const timestamps = emailCodeRateLimitStore.get(key) ?? [];
  const recentTimestamps = timestamps.filter(
    (timestamp: number) => nowMs - timestamp < windowMs
  );

  if (recentTimestamps.length >= limit) {
    emailCodeRateLimitStore.set(key, recentTimestamps);
    return false;
  }

  recentTimestamps.push(nowMs);
  emailCodeRateLimitStore.set(key, recentTimestamps);
  return true;
}

function buildRateLimitResponse() {
  return Response.json(
    {
      success: false,
      message: TOO_MANY_REQUESTS_MESSAGE,
      reason: "RATE_LIMITED",
    },
    {
      status: 429,
    }
  );
}

function buildCooldownResponse(retryAfterSeconds: number) {
  return Response.json(
    {
      success: false,
      message: `验证码刚刚发送过，请 ${retryAfterSeconds} 秒后再试`,
      reason: "COOLDOWN",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const purpose = String(body.purpose || "").trim().toUpperCase();

    if (!email) {
      return Response.json(
        {
          success: false,
          message: "邮箱不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        {
          success: false,
          message: "邮箱格式不正确",
        },
        {
          status: 400,
        }
      );
    }

    if (!isEmailCodePurpose(purpose)) {
      return Response.json(
        {
          success: false,
          message: "验证码用途无效",
        },
        {
          status: 400,
        }
      );
    }

    const nowMs = Date.now();
    const clientIp = getClientIp(request);
    const emailPurposeKey = `${email}:${purpose}`;

    const emailLimitAllowed = takeRateLimitSlot({
      key: `email:${emailPurposeKey}`,
      limit: EMAIL_CODE_RATE_LIMIT_MAX_REQUESTS,
      windowMs: EMAIL_CODE_RATE_LIMIT_WINDOW_MS,
      nowMs,
    });

    const ipLimitAllowed = takeRateLimitSlot({
      key: `ip:${clientIp}:${purpose}`,
      limit: EMAIL_CODE_IP_RATE_LIMIT_MAX_REQUESTS,
      windowMs: EMAIL_CODE_RATE_LIMIT_WINDOW_MS,
      nowMs,
    });

    if (!emailLimitAllowed || !ipLimitAllowed) {
      return buildRateLimitResponse();
    }

    const cooldownSince = new Date(nowMs - EMAIL_CODE_SEND_COOLDOWN_MS);
    const recentCode = await findRecentEmailVerificationCode({
      email,
      purpose,
      since: cooldownSince,
    });

    if (recentCode) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(
          (recentCode.createdAt.getTime() + EMAIL_CODE_SEND_COOLDOWN_MS - nowMs) /
            1000
        )
      );

      return buildCooldownResponse(retryAfterSeconds);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (purpose === "REGISTER" && existingUser) {
      return Response.json(
        {
          success: false,
          message: "这个邮箱已经注册过了，可以直接登录",
        },
        {
          status: 409,
        }
      );
    }

    if (purpose === "RESET_PASSWORD" && !existingUser) {
      await createEmailVerificationCode({
        email,
        purpose,
      });

      return Response.json({
        success: true,
        message: RESET_PASSWORD_MESSAGE,
      });
    }

    const verificationCode = await createEmailVerificationCode({
      email,
      purpose,
    });

    const emailContent = buildEmailContent({
      code: verificationCode.code,
      purpose,
    });

    const sendResult = await sendEmail({
      to: email,
      ...emailContent,
    });

    if (!sendResult.success) {
      return Response.json(
        {
          success: false,
          message: "验证码创建成功，但邮件发送失败，请稍后再试",
        },
        {
          status: 502,
        }
      );
    }

    if (purpose === "RESET_PASSWORD") {
      return Response.json({
        success: true,
        message: RESET_PASSWORD_MESSAGE,
      });
    }

    return Response.json({
      success: true,
      message: "验证码已发送，请查看邮箱",
    });
  } catch (error) {
    console.error("发送邮箱验证码失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器发送验证码失败",
      },
      {
        status: 500,
      }
    );
  }
}
