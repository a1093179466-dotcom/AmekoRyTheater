import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { posts } from "@/data/posts";
import PostCard from "@/components/PostCard";

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
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              author={post.author}
              createdAt={post.createdAt}
              price={post.price}
              isPaid={post.isPaid}
              commentCount={post.commentCount}
            />
          ))}

        </div>

      </section>

      <Footer />

    </main>
  );
}