import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import LikeButton from "@/components/LikeButton";
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
  likeCount?: number;
  favoriteCount?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  isLoggedIn?: boolean;

  // 封面图路径。
  // 旧调用如果暂时没传，就用默认图兜底，避免页面报错。
  coverImage?: string;
};

/**
 * 前台帖子卡片组件。
 *
 * 设计方向：
 * - 上方封面图
 * - 下方作品信息
 * - hover 时轻微发光
 * - 统一展示作品 / 公告 / 免费 / 付费 / 置顶状态
 */
export default function PostCard(props: PostCardProps) {
  const isNotice = props.type === "NOTICE";
  const coverImage = props.coverImage || "/images/test1.jpg";

  return (
    <article className="w-80 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-rose-300/40 hover:bg-white/[0.06] hover:shadow-rose-950/40">
      <Link href={`/gallery/${props.id}`} className="group block">
        <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
          <Image
            src={coverImage}
            alt={props.title}
            fill
            sizes="320px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4">
            <PostStatusBadges
              type={props.type}
              isPaid={props.isPaid}
              isPinned={props.isPinned}
              price={props.price}
            />
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/gallery/${props.id}`} className="group block">
          <h2 className="mb-3 text-2xl font-bold leading-snug text-white group-hover:text-rose-100 transition">
            {props.title}
          </h2>

          <p className="mb-5 min-h-12 text-sm leading-6 text-zinc-400">
            {props.excerpt}
          </p>
        </Link>

        <div className="mb-5 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {props.author}
          </span>

          <span>
            {props.createdAt}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
          <span className="font-medium text-zinc-200">
            {isNotice
              ? "公告通知"
              : props.isPaid
                ? `付费 ¥${props.price}`
                : "免费阅读"}
          </span>

          <span className="text-zinc-500">
            评论 {props.commentCount}
          </span>
        </div>

        {!isNotice && (
          <div className="mt-4 flex items-center gap-2">
            <LikeButton
              postId={props.id}
              initialLiked={Boolean(props.isLiked)}
              initialLikeCount={props.likeCount ?? 0}
              isLoggedIn={Boolean(props.isLoggedIn)}
            />

            <FavoriteButton
              postId={props.id}
              initialFavorited={Boolean(props.isFavorited)}
              initialFavoriteCount={props.favoriteCount ?? 0}
              isLoggedIn={Boolean(props.isLoggedIn)}
            />
          </div>
        )}
      </div>
    </article>
  );
}
