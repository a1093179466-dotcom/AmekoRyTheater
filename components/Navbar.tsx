export default function Navbar() {
  return (
    <nav className="w-full bg-zinc-900 text-white px-6 py-4 flex justify-between items-center">
      
      <h1 className="text-xl font-bold">
        AmekoRyTheater
      </h1>

      <div className="flex gap-4">
        <a href="/">首页</a>
        <a href="/gallery">作品</a>
        <a href="/about">关于</a>
        <a href="/login">登录</a>
      </div>

    </nav>
  );
}