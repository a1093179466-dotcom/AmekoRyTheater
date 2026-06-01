import Link from "next/link";

import PostStatusBadges from "@/components/PostStatusBadges";

type PostCardProps = {
  id: number;
  type: string;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
  price: number;
  isPaid: boolean;
  isPinned: boolean;
  commentCount: number;
};

/**
 * 前台帖子卡片组件。
 *
 * 用在：
 * - 首页
 * - 作品列表页
 * - 公告列表页
 *
 * 这个组件只负责展示卡片，不负责查询数据库。
 */
export default function PostCard(props: PostCardProps) {
  const isNotice = props.type === "NOTICE";

  return (
    <Link href={`/gallery/${props.id}`}>
      <article className="bg-zinc-900 p-6 rounded-2xl w-80 hover:bg-zinc-800 transition cursor-pointer border border-zinc-800">
        <div className="mb-3">
          <PostStatusBadges
            type={props.type}
            isPaid={props.isPaid}
            isPinned={props.isPinned}
            price={props.price}
          />
        </div>

        <h2 className="text-2xl font-bold mb-3">
          {props.title}
        </h2>

        <p className="text-zinc-400 mb-4">
          {props.excerpt}
        </p>

        <p className="text-sm text-zinc-500">
          作者：{props.author}
        </p>

        <p className="text-sm text-zinc-500">
          发布：{props.createdAt}
        </p>

        <div className="mt-4 flex justify-between text-sm text-zinc-300">
          <span>
            {isNotice
              ? "公告通知"
              : props.isPaid
                ? `¥${props.price}`
                : "免费"}
          </span>

          <span>
            评论 {props.commentCount}
          </span>
        </div>
      </article>
    </Link>
  );
}