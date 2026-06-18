"use client";

import { useRef, useState } from "react";

type GalleryImage = {
  id: number;
  imageUrl: string;
};

type PostImageGalleryProps = {
  images: GalleryImage[];
};

export default function PostImageGallery({
  images,
}: PostImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 防止鼠标滚轮一次触发太多次，导致图片疯狂切换。
  const wheelLockedRef = useRef(false);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  function showPrevious() {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function showNext() {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (images.length <= 1) {
      return;
    }

    if (wheelLockedRef.current) {
      return;
    }

    if (Math.abs(event.deltaY) < 20) {
      return;
    }

    event.preventDefault();

    wheelLockedRef.current = true;

    if (event.deltaY > 0) {
      showNext();
    } else {
      showPrevious();
    }

    window.setTimeout(() => {
      wheelLockedRef.current = false;
    }, 260);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-rose-300">
            Gallery
          </p>

          <h2 className="text-2xl font-bold">
            作品图集
          </h2>
        </div>

        <p className="text-sm text-zinc-500">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      <div
        onWheel={handleWheel}
        className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950"
      >
        <img
          src={currentImage.imageUrl}
          alt={`作品图 ${currentIndex + 1}`}
          className="max-h-[640px] w-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100"
              aria-label="上一张"
            >
              ←
            </button>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100"
              aria-label="下一张"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={
                index === currentIndex
                  ? "h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-rose-300 bg-white/10"
                  : "h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] opacity-60 transition hover:opacity-100"
              }
            >
              <img
                src={image.imageUrl}
                alt={`作品缩略图 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="mt-3 text-xs text-zinc-600">
          可以点击缩略图切换，也可以在大图区域滚动鼠标滚轮切换。
        </p>
      )}
    </section>
  );
}