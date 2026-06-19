# EPAY_FLOW.md

本文档记录 EPAY 真实支付接入前置设计。本轮只搭结构和文档，不替换当前模拟支付。

## Current Status

当前线上 / 本地开发仍使用模拟支付：

* `POST /api/orders` 创建 `PENDING` 订单。
* `/orders/[id]` 展示订单详情。
* `POST /api/orders/[id]/pay` 只用于模拟支付。
* 模拟支付成功后调用 `finalizePaidOrder`。

EPAY 真实支付尚未接入，不能把任何前端跳转或 `return_url` 当作支付成功依据。

## Environment Variables

需要在 `.env.local` 或部署环境变量中配置：

```env
EPAY_GATEWAY_URL="https://example-epay-gateway.example.com/submit.php"
EPAY_PID="your_epay_pid"
EPAY_KEY="your_epay_key"
EPAY_NOTIFY_URL="https://your-domain.example.com/api/payments/epay/notify"
EPAY_RETURN_URL="https://your-domain.example.com/orders/payment-return"
```

注意：

* `.env.example` 只能保留示例值。
* 不要把真实 `EPAY_PID`、`EPAY_KEY` 或商户后台截图发到聊天或提交到 Git。
* `EPAY_KEY` 只能在服务端使用，不得传给浏览器。

## Provider Structure

新增结构：

* `lib/paymentProviders/types.ts`
* `lib/paymentProviders/epay.ts`

当前 `epay.ts` 只提供：

* EPAY 环境变量读取。
* 配置完整性检查。
* 支付请求构建占位函数。
* notify 签名验证占位函数。
* 回调日志脱敏辅助函数。

它不会被现有模拟支付流程调用，也不会改变当前购买 / 解锁行为。

## Future Order Flow

下一轮真实接入建议保持订单创建逻辑不变：

1. 用户点击购买。
2. `POST /api/orders` 创建或复用有效的 `PENDING` 订单。
3. 后端读取订单、作品、用户信息。
4. 后端创建 EPAY 支付请求。
5. 前端跳转到 EPAY 收银台。
6. 用户在 EPAY 完成支付。
7. EPAY 请求后端 `notify_url`。
8. 后端验签、校验订单号、金额、状态。
9. 后端调用 `finalizePaidOrder`。
10. 用户回到 `return_url`，页面只展示结果，不写订单状态。

## Future API Shape

建议下一轮新增：

* `POST /api/payments/epay/create`
  * 登录用户才能调用。
  * 校验订单属于当前用户。
  * 校验订单仍是 `PENDING`。
  * 根据官方文档生成 EPAY 参数和签名。
  * 返回跳转 URL 或自动提交表单需要的参数。

* `POST /api/payments/epay/notify`
  * EPAY 服务端回调入口。
  * 不依赖登录态。
  * 必须验签。
  * 必须校验金额、订单号、支付状态。
  * 成功后调用 `finalizePaidOrder`。
  * 返回 EPAY 官方文档要求的确认文本。

* `GET /orders/payment-return`
  * 用户支付后返回页面。
  * 只读取订单状态并展示。
  * 不做支付成功写入。

具体方法名、参数名、HTTP method、成功响应文本必须以商户后台和官方文档为准。

## Notify URL Rules

`notify_url` 必须是 EPAY 服务器可以从公网访问的 HTTPS 地址。

建议最终配置：

```env
EPAY_NOTIFY_URL="https://668177.xyz/api/payments/epay/notify"
```

如果正式域名不是 `668177.xyz`，就替换为实际生产域名。

本地 `localhost`、局域网 IP、只在云电脑内部可访问的地址，都不能作为正式 `notify_url`。

内网穿透可以用于联调，但需要满足：

* 有稳定公网 HTTPS 地址。
* EPAY 能访问到该地址。
* Windows 防火墙、云电脑安全组、反向代理端口都已放行。
* 隧道不能频繁变更域名。

正式收费上线更建议使用固定域名和 HTTPS 反向代理，不建议长期依赖临时内网穿透。

## Return URL Rules

`return_url` 是用户浏览器跳回网站的页面。

建议最终配置：

```env
EPAY_RETURN_URL="https://668177.xyz/orders/payment-return"
```

`return_url` 不能：

* 直接把订单标记为已支付。
* 创建 `Purchase`。
* 发送购买通知。

它只能读取后端订单状态并提示“支付成功 / 待确认 / 支付失败”。

## Signature Verification

本轮不实现 EPAY 签名规则，因为还需要官方文档确认：

* 签名算法：MD5、HMAC，还是其他。
* 参与签名的字段列表。
* 是否排除 `sign`、`sign_type`。
* 字段排序规则。
* 空值字段是否参与签名。
* 拼接格式。
* 字符集。
* URL 编码规则。
* 金额字段格式。
* 成功状态字段和值。
* notify 成功后需要返回的文本。

在确认前，代码不得猜签名规则，也不得上线真实支付。

## Idempotency

EPAY notify 可能重复到达，后端必须幂等：

* 通过 `orderNo` 查找内部订单。
* 如果订单已经 `PAID`，验证金额和平台流水后返回成功。
* 不重复创建 `Purchase`。
* 不重复创建管理员购买通知。
* 不重复发送购买邮件。
* 对 `CANCELLED` 订单的处理策略需要在真实支付接入前确认。

当前 `finalizePaidOrder` 已经集中处理：

* `PENDING` 到 `PAID` 的状态更新。
* `Purchase` upsert。
* 管理员购买通知。
* 买家购买成功邮件。
* 重复调用的 paid-state 返回。

真实 EPAY notify 验签成功后应复用 `finalizePaidOrder`，不要复制订单解锁逻辑。

## Amount And Order Validation

notify_url 必须校验：

* EPAY 回传订单号对应本地 `Order.orderNo`。
* 本地订单存在。
* 本地订单金额与 EPAY 回传金额一致。
* 本地订单仍符合允许支付的状态策略。
* EPAY 回传支付状态是官方定义的成功状态。
* EPAY 平台流水号可保存到 `Order.providerTradeNo`。
* EPAY 支付方式可保存到 `Order.paymentType`。

金额格式必须确认：

* 本项目当前 `Order.amount` 是整数，展示为人民币元。
* EPAY 是否要求 `1`、`1.00` 或分为单位，需要官方文档确认。

## Fields To Confirm

需要从商户后台和官方文档确认：

* 正式网关地址。
* 商户号字段名和值。
* 商户密钥。
* 支持的支付方式值。
* 支付请求路径和 HTTP method。
* 支付请求字段名：订单号、金额、商品名、notify_url、return_url 等。
* 支付请求签名规则。
* notify 回调字段名：商户订单号、平台流水号、金额、状态、支付方式、签名等。
* notify 回调 method。
* notify 成功响应文本。
* return_url 字段和参数。
* notify 重试规则和超时时间。
* 是否支持 sandbox / test mode。
* IP 白名单或域名绑定要求。

## Next Integration Files

下一轮真实接入预计会改：

* `lib/paymentProviders/epay.ts`
* `lib/paymentProviders/types.ts`
* `app/api/payments/epay/create/route.ts`
* `app/api/payments/epay/notify/route.ts`
* `app/orders/payment-return/page.tsx`
* `components/PayOrderButton.tsx` 或新增 `EpayPayButton.tsx`
* `app/orders/[id]/page.tsx`
* `lib/payment.ts`
* `PAYMENT_FLOW.md`

如需记录回调审计，还可能新增 Prisma 模型，例如 `PaymentCallbackLog`。是否新增应等官方字段确认后决定。
