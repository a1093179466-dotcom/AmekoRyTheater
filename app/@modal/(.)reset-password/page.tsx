import AuthDialog from "@/components/AuthDialog";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordModalPage() {
  return (
    <AuthDialog>
      <ResetPasswordForm showHeader />
    </AuthDialog>
  );
}
