import { requireAdminPage } from "@/lib/auth";
import UploadPostForm from "@/components/UploadPostForm";

/**
 * 发布帖子页面。
 *
 * 这个文件是服务端页面，负责检查管理员权限。
 * 真正的表单交互放在 UploadPostForm 客户端组件里。
 */
export default async function UploadPostPage() {
  // 只有管理员可以进入发布页面
  await requireAdminPage();

  return <UploadPostForm />;
}