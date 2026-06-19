export type PaymentProviderId = "SIMULATED" | "EPAY";

export type PaymentCreateInput = {
  orderId: number;
  orderNo: string;
  amount: number;
  subject: string;
  body?: string;
  userId: number;
  notifyUrl: string;
  returnUrl: string;
};

export type PaymentCreateResult = {
  provider: PaymentProviderId;
  method: "GET" | "POST";
  paymentUrl: string;
  params: Record<string, string>;
};

export type PaymentNotifyPayload = Record<string, string | string[] | undefined>;

export type PaymentNotifyStatus =
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "UNKNOWN";

export type PaymentNotifyVerificationResult = {
  ok: boolean;
  provider: PaymentProviderId;
  status: PaymentNotifyStatus;
  orderNo?: string;
  amount?: number;
  providerTradeNo?: string;
  paymentType?: string;
  paidAt?: Date;
  message?: string;
};

export type PaymentProviderConfigStatus = {
  configured: boolean;
  missingKeys: string[];
};
