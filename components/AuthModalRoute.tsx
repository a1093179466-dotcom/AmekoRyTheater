"use client";

import { useRouter } from "next/navigation";

import AuthDialog from "@/components/AuthDialog";
import AuthForm from "@/components/AuthForm";

type AuthModalRouteProps = {
  mode: "login" | "register";
};

export default function AuthModalRoute({
  mode,
}: AuthModalRouteProps) {
  const router = useRouter();

  return (
    <AuthDialog>
      <AuthForm
        defaultMode={mode}
        onLoginSuccess={(user) => {
        if (user.role === "ADMIN") {
            // 管理员登录后进入后台。
            // 这里使用完整页面跳转，避免 intercepting route 的登录弹窗残留。
            window.location.href = "/dashboard";
            return;
        }

        // 普通用户关闭弹窗，回到原页面并刷新登录状态。
        router.back();
        router.refresh();
        }}
      />
    </AuthDialog>
  );
}