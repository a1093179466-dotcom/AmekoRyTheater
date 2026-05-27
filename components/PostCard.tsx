import Link from "next/link";

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
 *
 * 它只负责展示，不负责查询数据库。
 */
export default function PostCard(props: PostCardProps) {
  return (
    <Link href={`/gallery/${props.id}`}>
      <article className="bg-zinc-900 p-6 rounded-2xl w-80 hover:bg-zinc-800 transition cursor-pointer border border-zinc-800">
        <div className="flex gap-2 mb-3 text-xs">
          <span className="bg-zinc-800 px-2 py-1 rounded-full text-zinc-300">
            {props.type === "NOTICE" ? "公告" : "作品"}
          </span>

          {props.isPinned && (
            <span className="bg-yellow-900/40 px-2 py-1 rounded-full text-yellow-300">
              置顶
            </span>
          )}

          {props.isPaid ? (
            <span className="bg-red-900/40 px-2 py-1 rounded-full text-red-300">
              付费
            </span>
          ) : (
            <span className="bg-green-900/40 px-2 py-1 rounded-full text-green-300">
              免费
            </span>
          )}
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
            {props.isPaid ? `¥${props.price}` : "免费"}
          </span>

          <span>
            评论 {props.commentCount}
          </span>
        </div>
      </article>
    </Link>
  );
}