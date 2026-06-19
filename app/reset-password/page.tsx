import AuthPageShell from "@/components/AuthPageShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="重置密码"
      subtitle="填写邮箱验证码和新密码，完成后即可用新密码登录。"
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
