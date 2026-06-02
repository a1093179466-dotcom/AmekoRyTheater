import { randomBytes } from "crypto";

/**
 * 生成商户订单号。
 *
 * 格式示例：
 * AMR202605301230459F3A2B
 *
 * 含义：
 * AMR      = AmekoRyTheater 简写
 * 时间部分 = 年月日时分秒
 * 随机部分 = 防止同一秒内重复下单
 *
 * 以后接入真实支付时，这个值可以作为 out_trade_no 使用。
 */
export function generateOrderNo() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const randomPart = randomBytes(3).toString("hex").toUpperCase();

  return `AMR${year}${month}${day}${hour}${minute}${second}${randomPart}`;
}

/**
 * 获取订单展示用编号。
 *
 * 旧订单可能没有 orderNo，所以这里做一个兜底。
 */
export function getDisplayOrderNo(order: {
  id: number;
  orderNo: string | null;
}) {
  return order.orderNo || `LEGACY-${order.id}`;
}