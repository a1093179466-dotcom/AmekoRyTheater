import { artworks } from "@/data/artworks";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ArtworkDetailPage({ params }: PageProps) {
  const { id } = await params;

  const artwork = artworks.find((item) => item.id === Number(id));

  if (!artwork) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">作品不存在</h1>
        <p className="text-zinc-400">没有找到 ID 为 {id} 的作品。</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        {artwork.title}
      </h1>

      <p className="text-zinc-400 mb-4">
        {artwork.description}
      </p>

      <p className="mb-2">
        作者：{artwork.author}
      </p>

      <p className="mb-2">
        发布时间：{artwork.createdAt}
      </p>

      <p>
        {artwork.isPaid ? `售价：¥${artwork.price}` : "免费作品"}
      </p>
    </main>
  );
}