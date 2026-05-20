import Link from "next/link";

type DashboardBackLinkProps = {
  href?: string;
  label?: string;
};

export default function DashboardBackLink({
  href = "/dashboard",
  label = "← 返回后台管理",
}: DashboardBackLinkProps) {
  return (
    <div className="mb-8">
      {/*
        Link 是 Next.js 的页面跳转组件。
        这里不用普通 <a>，是因为 Link 跳转更快，也更符合 Next.js 的路由方式。
      */}
      <Link
        href={href}
        className="inline-block text-zinc-400 hover:text-white underline transition"
      >
        {label}
      </Link>
    </div>
  );
}