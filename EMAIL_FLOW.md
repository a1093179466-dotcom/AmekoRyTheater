# EMAIL_FLOW.md

## Current Phase

当前阶段是 dev-console 邮件模式，不接入真实 SMTP，也不会真正向用户邮箱发送邮件。

开发环境里，业务代码调用 `lib/email.ts` 的 `sendEmail` 后，邮件收件人、标题和正文会输出到服务端控制台，便于本地测试邮箱验证码流程。

## Unified Email Sender

`lib/email.ts` 是项目统一邮件出口。

后续接入真实 SMTP 或第三方邮件服务时，应优先替换 `sendEmail` 内部实现，不要让业务 API 直接依赖具体邮件服务。

当前 `sendEmail` 返回统一结构：

* `success`
* `provider`

当前 provider 为 `dev-console`。

## Email Verification Codes

`EmailVerificationCode` 用于注册验证码和找回密码验证码。

当前支持的 purpose：

* `REGISTER`
* `RESET_PASSWORD`

验证码默认有效期建议为 10 分钟。验证码成功校验后必须写入 `consumedAt`，已使用或过期验证码不可继续使用。

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

`REGISTER` 会检查邮箱是否已注册；已注册时返回友好错误。

`RESET_PASSWORD` 不暴露邮箱是否存在。即使邮箱不存在，也返回类似“如果邮箱存在，我们会发送验证码”的成功提示，避免泄露账号存在性。

## Security Rules

* 不在日志输出用户密码。
* 找回密码流程不暴露邮箱是否存在。
* 验证码使用后必须 consumed。
* 过期验证码不可用。
* 后续上线前要配置真实邮件服务和环境变量。
* 业务 API 不直接依赖 SMTP 或第三方邮件 SDK。

## Next Steps

下一轮建议接入注册邮箱验证码：

* 注册页增加发送验证码入口。
* 注册页增加验证码输入框。
* 注册 API 校验 `REGISTER` 验证码后再创建用户。
* 保持现有 FeedbackProvider 交互，不使用 `alert` / `window.confirm`。
