"use client";

import { useEffect, useRef, useState } from "react";

type ExistingImage = {
  id: number;
  imageUrl: string;
};

type GalleryImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  existingImages?: ExistingImage[];
};

export default function GalleryImagePicker({
  files,
  onChange,
  existingImages = [],
}: GalleryImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleSelectFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) {
      return;
    }

    const nextFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith("image/")
    );

    onChange([...files, ...nextFiles]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemoveNewImage(index: number) {
    onChange(files.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="flex flex-col gap-5">
      {existingImages.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-zinc-400">已有作品图</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"
              >
                <img
                  src={image.imageUrl}
                  alt="已有作品图"
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-zinc-600">
            当前版本先支持追加新图，删除旧图下一轮再做。
          </p>
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleSelectFiles(event.target.files)}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
          >
            选择多张作品图
          </button>

          {files.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              清空新选择
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          可一次选择多张图片，支持 png / jpg / webp / gif。
        </p>
      </div>

      {previewUrls.length > 0 ? (
        <div>
          <p className="mb-3 text-sm text-zinc-400">新选择预览</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"
              >
                <img
                  src={url}
                  alt={`新作品图 ${index + 1}`}
                  className="h-40 w-full object-cover"
                />

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                  <span className="truncate text-xs text-zinc-500">
                    {files[index]?.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="shrink-0 text-xs text-red-300 hover:text-red-200 transition"
                  >
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center text-zinc-500">
          选择图片后会在这里显示多图预览
        </div>
      )}
    </div>
  );
}