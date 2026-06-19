# EMAIL_FLOW.md

## Current Phase

当前邮件系统支持两种模式：

* `dev-console`：只输出到服务端控制台，不真实发送邮件。
* `resend`：通过 Resend 真实发送邮件。

本地开发如果只想验证流程，可以使用 `dev-console`。需要测试真实收信时，在本机 `.env.local` 或部署环境变量中配置 `EMAIL_PROVIDER=resend`。

## Unified Email Sender

`lib/email.ts` 是项目统一邮件出口。

业务 API 只调用 `sendEmail`，不直接依赖 Resend SDK。后续如果替换 SMTP 或其他第三方邮件服务，应优先替换 `lib/email.ts` 内部实现。

`sendEmail` 返回统一结构：

* `success`
* `provider`
* `id`，真实服务发送成功时可能返回
* `message`，发送失败时返回

当前 provider 支持：

* `dev-console`
* `resend`

## Environment Variables

示例配置：

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="AmekoRyTheater <no-reply@668177.xyz>"
```

只做本地控制台测试时：

```env
EMAIL_PROVIDER=dev-console
```

`RESEND_API_KEY` 只能放在本机 `.env.local`、服务器环境变量或受保护的 `.env` 中，不要提交到 Git。`EMAIL_FROM` 使用的域名需要先在 Resend 控制台完成验证。

## Dev Console Mode

`EMAIL_PROVIDER` 不是 `resend` 时，默认使用 `dev-console`。

`sendEmail` 会把邮件内容输出到服务端控制台：

* to
* subject
* text
* html

这种模式不会真实发送邮件，适合本地开发。

## Resend Mode

`EMAIL_PROVIDER=resend` 时，`lib/email.ts` 会读取：

* `RESEND_API_KEY`
* `EMAIL_FROM`

然后调用 Resend SDK：

```ts
resend.emails.send({
  from,
  to,
  subject,
  text,
  html,
});
```

发送成功时返回 `success=true`、`provider="resend"`，并尽量返回 Resend email id。

发送失败时返回 `success=false`，发送验证码 API 会返回失败提示。服务端日志会输出收件人、标题和 Resend 返回的错误名称 / 状态码 / 信息，但不会输出 API Key。

如果缺少 `RESEND_API_KEY` 或 `EMAIL_FROM`，`sendEmail` 会返回失败结构，并在服务端日志提示配置缺失。

## Register Email Verification

注册页已经接入邮箱验证码：

1. 用户填写邮箱。
2. 点击“发送验证码”。
3. 前端调用 `POST /api/auth/send-email-code`，参数为 `purpose=REGISTER`。
4. 发送成功后按钮进入 60 秒倒计时，避免重复点击。
5. 用户填写昵称、密码、确认密码和邮箱验证码。
6. 注册页提交 `POST /api/auth/register`，请求体包含 `emailCode`。
7. 注册 API 调用 `verifyEmailCode` 校验邮箱、purpose 和验证码。
8. 验证码正确、未过期、未使用时，注册 API 会标记 `consumedAt` 并创建用户。
9. 验证码错误、已过期或已使用时，注册失败并返回友好提示。

已注册邮箱请求 `REGISTER` 验证码时，`POST /api/auth/send-email-code` 返回 409 和友好提示，不会发送邮件。

## Email Verification Codes

`EmailVerificationCode` 用于注册验证码和找回密码验证码。

当前支持的 purpose：

* `REGISTER`
* `RESET_PASSWORD`

验证码默认有效期建议为 10 分钟。验证码成功校验后必须写入 `consumedAt`，已使用或过期验证码不可继续使用。

## Password Reset Flow

找回密码流程已经接入：

1. 用户从 `/login` 或登录弹窗点击“忘记密码？”。
2. `/forgot-password` 输入邮箱并发送验证码。
3. 前端调用 `POST /api/auth/send-email-code`，参数为 `purpose=RESET_PASSWORD`。
4. 发送接口不暴露邮箱是否存在。不存在的邮箱也返回泛化成功提示，但不会真实创建验证码。
5. 用户进入 `/reset-password`，填写邮箱、验证码、新密码、确认新密码。
6. `/api/auth/reset-password` 先确认邮箱对应用户存在，但不存在时只返回“验证码无效”，不暴露账号存在性。
7. API 调用 `verifyEmailCode` 校验 `RESET_PASSWORD` 验证码。
8. 验证码正确、未过期、未使用时，更新用户密码并消费验证码。
9. 重置成功后会清理该用户旧 session，需要重新登录。
10. 验证码错误、已过期或已使用时，重置失败并返回友好提示。

## Password Reset Tokens

`PasswordResetToken` 用于后续找回密码链接流程。

建议有效期为 30 分钟。后续正式接入找回密码页面时，重置成功后应消费 token，并考虑清理旧 session。

## Current API

`POST /api/auth/send-email-code` 用于发送邮箱验证码。

请求示例：

```json
{
  "email": "xxx@example.com",
  "purpose": "REGISTER"
}
```

`POST /api/auth/register` 现在必须携带注册验证码。

请求示例：

```json
{
  "email": "xxx@example.com",
  "name": "用户名",
  "password": "至少 6 位密码",
  "emailCode": "123456"
}
```


`POST /api/auth/reset-password` 用于重置密码。

请求示例：

```json
{
  "email": "xxx@example.com",
  "emailCode": "123456",
  "password": "new-password",
  "confirmPassword": "new-password"
}
```

密码规则沿用注册逻辑：至少 6 位，且两次输入必须一致。

`REGISTER` 会检查邮箱是否已注册；已注册时返回友好错误。

`RESET_PASSWORD` 不暴露邮箱是否存在。即使邮箱不存在，也返回类似“如果邮箱存在，我们会发送验证码”的成功提示，避免泄露账号存在性。

## Security Rules

* 不在日志输出用户密码。
* 不在日志输出 Resend API Key。
* 找回密码流程不暴露邮箱是否存在。
* 重置密码成功后会清理该用户旧 session。
* 注册验证码使用后必须 consumed。
* 过期验证码不可用。
* 真实发送前要配置 Resend API Key、发件人和已验证域名。
* 不把真实 `RESEND_API_KEY` 写入 `.env.example` 或提交到 Git。
* 业务 API 不直接依赖 SMTP 或第三方邮件 SDK。

## Next Steps

下一轮建议接入邮件通知偏好或继续完善账号安全：

* 个人中心增加邮件通知偏好。
* 后续发布作品时可选择邮件通知用户。
* 上线前继续确认 Resend 域名、额度、退信和垃圾箱表现。
