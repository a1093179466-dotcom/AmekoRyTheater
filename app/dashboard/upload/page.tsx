"use client";

import { useState } from "react";

export default function UploadArtworkPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

async function handleSubmit() {

  if (!title.trim()) {
    alert("标题不能为空");
    return;
  }

  if (!description.trim()) {
    alert("描述不能为空");
    return;
  }

  if (isNaN(Number(price))) {
    alert("价格必须是数字");
    return;
  }

  if (Number(price) < 0) {
    alert("价格不能小于0");
    return;
  }

  setLoading(true);

  const response = await fetch("/api/artworks", {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    title,
    description,
    price: Number(price),
  }),
});

const result = await response.json();

console.log(result);

  const newArtwork = {
    title,
    description,
    price: Number(price),
  };

  console.log("准备发布的作品：", newArtwork);

  alert("作品发布成功！");

  setLoading(false);
}
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">发布新作品</h1>

      <div className="flex flex-col gap-4 max-w-xl">
        <input
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            placeholder="作品标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 h-32"
            placeholder="作品描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <input
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
            placeholder="价格，例如 30"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
        />
        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                setImage(e.target.files[0]);
                }
            }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-white text-black rounded-xl px-6 py-3 hover:bg-zinc-300 transition disabled:bg-zinc-500"
        >
        {loading ? "发布中..." : "发布作品"}
        </button>
      </div>

      <section className="mt-10 bg-zinc-900 p-6 rounded-2xl max-w-xl">
        <h2 className="text-2xl font-bold mb-4">当前输入预览</h2>
        <p>标题：{title}</p>
        <p>描述：{description}</p>
        <p>价格：{price}</p>
        <p>图片：{image ? image.name : "未选择图片"}</p>
      </section>
    </main>
  );
}