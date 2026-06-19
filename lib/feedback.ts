export const feedbackTypes = [
  {
    value: "BUG",
    label: "问题反馈",
  },
  {
    value: "FEATURE",
    label: "功能建议",
  },
  {
    value: "PURCHASE",
    label: "购买问题",
  },
  {
    value: "OTHER",
    label: "其他",
  },
] as const;

export const feedbackStatuses = [
  {
    value: "OPEN",
    label: "待处理",
  },
  {
    value: "IN_PROGRESS",
    label: "处理中",
  },
  {
    value: "RESOLVED",
    label: "已解决",
  },
  {
    value: "CLOSED",
    label: "已关闭",
  },
] as const;

export type FeedbackType = (typeof feedbackTypes)[number]["value"];
export type FeedbackStatus = (typeof feedbackStatuses)[number]["value"];

export function isFeedbackType(value: unknown): value is FeedbackType {
  return feedbackTypes.some((item) => item.value === value);
}

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return feedbackStatuses.some((item) => item.value === value);
}

export function getFeedbackTypeLabel(type: string) {
  return feedbackTypes.find((item) => item.value === type)?.label ?? type;
}

export function getFeedbackStatusLabel(status: string) {
  return feedbackStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getFeedbackStatusClassName(status: string) {
  if (status === "OPEN") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }

  if (status === "IN_PROGRESS") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-100";
  }

  if (status === "RESOLVED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  }

  if (status === "CLOSED") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
  }

  return "border-white/10 bg-white/5 text-zinc-300";
}
