import { Resend } from "resend";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type EmailProvider = "dev-console" | "resend";

type SendEmailResult =
  | {
      success: true;
      provider: EmailProvider;
      id?: string;
    }
  | {
      success: false;
      provider: EmailProvider;
      message: string;
    };

function getEmailProvider(): EmailProvider {
  return process.env.EMAIL_PROVIDER === "resend" ? "resend" : "dev-console";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown email error";
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  const provider = getEmailProvider();

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      console.error("[resend email] Missing email environment variables", {
        hasApiKey: Boolean(apiKey),
        hasFrom: Boolean(from),
      });

      return {
        success: false,
        provider,
        message: "邮件服务配置不完整",
      };
    }

    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });

      if (result.error) {
        console.error("[resend email] Send failed", {
          to,
          subject,
          errorName: result.error.name,
          statusCode: result.error.statusCode,
          message: result.error.message,
        });

        return {
          success: false,
          provider,
          message: result.error.message,
        };
      }

      return {
        success: true,
        provider,
        id: result.data.id,
      };
    } catch (error) {
      console.error("[resend email] Send failed", {
        to,
        subject,
        message: getErrorMessage(error),
      });

      return {
        success: false,
        provider,
        message: "邮件发送失败",
      };
    }
  }

  // dev-console 模式只输出邮件内容，方便本地开发测试。
  console.log("[dev-console email]", {
    to,
    subject,
    text,
    html,
  });

  return {
    success: true,
    provider,
  };
}
