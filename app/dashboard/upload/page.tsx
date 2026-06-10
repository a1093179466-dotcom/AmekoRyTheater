import { requireAdminPage } from "@/lib/auth";
import UploadPostForm from "@/components/UploadPostForm";

export default async function UploadPostPage() {
  await requireAdminPage();

  return <UploadPostForm />;
}