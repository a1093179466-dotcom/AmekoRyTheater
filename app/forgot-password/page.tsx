import AuthPageShell from "@/components/AuthPageShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="找回密码"
      subtitle="输入注册邮箱，我们会发送用于重置密码的验证码。"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
