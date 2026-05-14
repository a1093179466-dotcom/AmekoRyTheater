import Link from "next/link";

type PostCardProps = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
  price: number;
  isPaid: boolean;
  commentCount: number;
};

export default function PostCard(props: PostCardProps) {
  return (
    <Link href={`/gallery/${props.id}`}>
      <article className="bg-zinc-900 p-6 rounded-2xl w-80 hover:bg-zinc-800 transition cursor-pointer">
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

        <div className="mt-4 flex justify-between text-sm">
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