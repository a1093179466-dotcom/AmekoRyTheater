export default function Home() {
  return (
    <main className="min-h-screen bg-white text-white flex flex-col items-center justify-center">
      
      <h1 className="text-5xl font-bold mb-4 text-black">
        AmekoRyTheater
      </h1>

      <p className="text-gray-400 mb-6">
        欢迎来到我的个人创作剧场
      </p>

      <button className="bg-white text-black px-6 py-2 rounded-xl hover:bg-gray-300 transition">
        查看作品
      </button>

    </main>
  );
}