import Link from "next/link";

/**
 * 导航栏登录 / 注册入口。
 *
 * 使用 Link 跳转到 /login /register。
 * 在站内点击时会被 app/@modal/(.)login 和 app/@modal/(.)register 拦截，
 * 以弹窗形式显示。
 */
export default function AuthNavButtons() {
  return (
    <>
      <Link
        href="/login"
        className="text-zinc-300 hover:text-white transition"
      >
        登录
      </Link>

      <Link
        href="/register"
        className="rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-rose-100 transition"
      >
        注册
      </Link>
    </>
  );
}