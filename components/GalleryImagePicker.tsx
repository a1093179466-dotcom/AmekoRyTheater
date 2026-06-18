"use client";

import { useEffect, useRef, useState } from "react";
import { useFeedback } from "@/components/FeedbackProvider";

type ExistingImage = {
  id: number;
  imageUrl: string;
};

type GalleryImagePickerProps = {
  files: File[];
  onChange: (files: File[]) => void;
  existingImages?: ExistingImage[];
};

type NewImagePreviewProps = {
  file: File;
  index: number;
  onRemove: (index: number) => void;
};

function NewImagePreview({
  file,
  index,
  onRemove,
}: NewImagePreviewProps) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      <img
        src={previewUrl}
        alt={`新作品图 ${index + 1}`}
        className="h-40 w-full object-cover"
      />

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <span className="truncate text-xs text-zinc-500">{file.name}</span>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 text-xs text-red-300 hover:text-red-200 transition"
        >
          移除
        </button>
      </div>
    </div>
  );
}

export default function GalleryImagePicker({
  files,
  onChange,
  existingImages,
}: GalleryImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast, confirm } = useFeedback();
  const [existingImageItems, setExistingImageItems] = useState<ExistingImage[]>(
    () => existingImages ?? []
  );
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

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

  async function handleDeleteExistingImage(image: ExistingImage) {
    const confirmed = await confirm({
      title: "删除作品图",
      message: "确定要删除这张旧作品图吗？删除后无法恢复。",
      confirmText: "删除",
      cancelText: "取消",
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    setDeletingImageId(image.id);

    const response = await fetch(`/api/post-images/${image.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    setDeletingImageId(null);

    if (!response.ok || !result.success) {
      toast(result.message || "删除作品图失败", "error");
      return;
    }

    setExistingImageItems((current) =>
      current.filter((item) => item.id !== image.id)
    );
    toast(result.message || "作品图已删除", "success");
  }

  return (
    <div className="flex flex-col gap-5">
      {existingImageItems.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-zinc-400">已有作品图</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {existingImageItems.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"
              >
                <img
                  src={image.imageUrl}
                  alt="已有作品图"
                  className="h-40 w-full object-cover"
                />

                <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                  <span className="truncate text-xs text-zinc-500">
                    已保存
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(image)}
                    disabled={deletingImageId === image.id}
                    className="shrink-0 text-xs text-red-300 hover:text-red-200 transition disabled:cursor-not-allowed disabled:text-zinc-600"
                  >
                    {deletingImageId === image.id ? "删除中..." : "删除"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-zinc-600">
            删除只会移除这张作品图，不会影响封面或新选择的图片。
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

      {files.length > 0 ? (
        <div>
          <p className="mb-3 text-sm text-zinc-400">新选择预览</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => (
              <NewImagePreview
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                file={file}
                index={index}
                onRemove={handleRemoveNewImage}
              />
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
