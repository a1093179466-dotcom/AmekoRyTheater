/**
 * 旧购买 API
 *
 * 这个接口以前会直接创建 Purchase。
 * 现在购买流程已经升级为：
 *
 * 1. 创建 Order
 * 2. 支付 Order
 * 3. 支付成功后创建 Purchase
 *
 * 所以这里不再允许直接创建 Purchase，
 * 避免用户绕过订单流程直接解锁作品。
 */
export async function POST() {
  return Response.json(
    {
      success: false,
      message: "购买流程已升级，请通过订单系统购买",
    },
    {
      status: 410,
    }
  );
}