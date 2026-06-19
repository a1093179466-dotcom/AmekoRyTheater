type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendEmailResult = {
  success: boolean;
  provider: "dev-console";
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  // 当前阶段不接入真实 SMTP，只把邮件内容输出到服务端控制台。
  console.log("[dev-console email]", {
    to,
    subject,
    text,
    html,
  });

  return {
    success: true,
    provider: "dev-console",
  };
}
