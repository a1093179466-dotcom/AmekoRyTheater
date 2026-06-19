import AuthDialog from "@/components/AuthDialog";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordModalPage() {
  return (
    <AuthDialog>
      <ForgotPasswordForm showHeader />
    </AuthDialog>
  );
}
