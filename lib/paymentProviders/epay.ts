import type {
  PaymentCreateInput,
  PaymentCreateResult,
  PaymentNotifyPayload,
  PaymentNotifyVerificationResult,
  PaymentProviderConfigStatus,
} from "@/lib/paymentProviders/types";

export type EpayConfig = {
  gatewayUrl: string;
  pid: string;
  key: string;
  notifyUrl: string;
  returnUrl: string;
};

const epayEnvKeys = [
  "EPAY_GATEWAY_URL",
  "EPAY_PID",
  "EPAY_KEY",
  "EPAY_NOTIFY_URL",
  "EPAY_RETURN_URL",
] as const;

export function getEpayConfig(): EpayConfig {
  return {
    gatewayUrl: process.env.EPAY_GATEWAY_URL?.trim() ?? "",
    pid: process.env.EPAY_PID?.trim() ?? "",
    key: process.env.EPAY_KEY?.trim() ?? "",
    notifyUrl: process.env.EPAY_NOTIFY_URL?.trim() ?? "",
    returnUrl: process.env.EPAY_RETURN_URL?.trim() ?? "",
  };
}

export function getEpayConfigStatus(
  config: EpayConfig = getEpayConfig()
): PaymentProviderConfigStatus {
  const values: Record<(typeof epayEnvKeys)[number], string> = {
    EPAY_GATEWAY_URL: config.gatewayUrl,
    EPAY_PID: config.pid,
    EPAY_KEY: config.key,
    EPAY_NOTIFY_URL: config.notifyUrl,
    EPAY_RETURN_URL: config.returnUrl,
  };

  const missingKeys = epayEnvKeys.filter((key) => !values[key]);

  return {
    configured: missingKeys.length === 0,
    missingKeys,
  };
}

export function assertEpayConfig(config: EpayConfig = getEpayConfig()) {
  const status = getEpayConfigStatus(config);

  if (!status.configured) {
    throw new Error(`Missing EPAY environment variables: ${status.missingKeys.join(", ")}`);
  }
}

export function buildEpayPaymentRequest(
  _input: PaymentCreateInput,
  config: EpayConfig = getEpayConfig()
): PaymentCreateResult {
  assertEpayConfig(config);

  throw new Error(
    "EPAY payment request builder is intentionally not implemented until the merchant backend and official docs confirm request fields, amount format, and signature rules."
  );
}

export function verifyEpayNotifySignature(
  _payload: PaymentNotifyPayload,
  config: EpayConfig = getEpayConfig()
): PaymentNotifyVerificationResult {
  assertEpayConfig(config);

  return {
    ok: false,
    provider: "EPAY",
    status: "UNKNOWN",
    message:
      "EPAY notify signature verification is intentionally disabled until the official signing algorithm and field rules are confirmed.",
  };
}

export function sanitizeEpayPayloadForLog(payload: PaymentNotifyPayload) {
  const sanitized: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (/key|secret|token|sign/i.test(key)) {
      sanitized[key] = "[redacted]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
