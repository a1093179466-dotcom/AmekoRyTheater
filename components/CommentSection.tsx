export default function CommentSection() {
  return (
    <section className="mt-10 bg-zinc-900 p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">评论区</h2>

      <div className="flex flex-col gap-4">
        <div className="border-b border-zinc-700 pb-4">
          <p className="font-bold">测试用户A</p>
          <p className="text-zinc-400 mt-1">
            这个作品很喜欢，期待后续更新。
          </p>
        </div>

        <div className="border-b border-zinc-700 pb-4">
          <p className="font-bold">测试用户B</p>
          <p className="text-zinc-400 mt-1">
            已购买，内容质量不错。
          </p>
        </div>
      </div>

      <div className="mt-8">
        <textarea
          className="w-full bg-black border border-zinc-700 rounded-xl p-4"
          placeholder="登录后可以发表评论"
          rows={4}
        />

        <button className="mt-4 bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-300 transition">
          发表评论
        </button>
      </div>
    </section>
  );
}