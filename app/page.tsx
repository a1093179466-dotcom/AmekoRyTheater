import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { artworks } from "@/data/artworks";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <section className="flex flex-col items-center pt-24">

        <h1 className="text-6xl font-bold mb-6">
          AmekoRyTheater
        </h1>

        <p className="text-zinc-400 mb-12">
          欢迎来到我的个人创作剧场
        </p>

        <div className="flex gap-6 flex-wrap justify-center">

          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              description={artwork.description}
              author={artwork.author}
              price={artwork.price}
              isPaid={artwork.isPaid}
            />
          ))}

        </div>

      </section>

      <Footer />

    </main>
  );
}