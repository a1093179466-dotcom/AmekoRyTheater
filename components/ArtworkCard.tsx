import Link from "next/link";

type ArtworkCardProps = {
  id: number;
  title: string;
  description: string;
  author: string;
  price: number;
  isPaid: boolean;
};

export default function ArtworkCard(props: ArtworkCardProps) {
return (
  <Link href={`/gallery/${props.id}`}>
    
    <div className="bg-zinc-900 p-6 rounded-2xl w-80 hover:bg-zinc-800 transition cursor-pointer">

      <h2 className="text-2xl font-bold mb-2">
        {props.title}
      </h2>

      <p className="text-zinc-400 mb-4">
        {props.description}
      </p>

      <p className="text-sm text-zinc-500">
        作者：{props.author}
      </p>

      <p className="mt-2">
        {props.isPaid
          ? `售价：¥${props.price}`
          : "免费作品"}
      </p>

    </div>

  </Link>
);
}