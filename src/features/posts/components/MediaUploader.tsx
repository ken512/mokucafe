"use client"

import { useRef } from "react"
import Image from "next/image"

type FileState = { status: "uploading" | "done" | "error"; error?: string } | undefined

type Props = {
  images: File[]
  video: File | null
  onImagesChange: (files: File[]) => void
  onVideoChange: (file: File | null) => void
  // アップロード状態をサムネイルに表示するために受け取る（省略時はオーバーレイなし）
  getFileState?: (file: File) => FileState
}

// ファイルのアップロード状態オーバーレイ
const UploadOverlay = ({ state }: { state: FileState }) => {
  if (!state || state.status === "done") return null
  if (state.status === "uploading") {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  // error
  return (
    <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center rounded-xl">
      <span className="text-white text-xs text-center px-1">{state.error ?? "エラー"}</span>
    </div>
  )
}

// 画像2枚・動画1本をボタンクリックで選択するUI
const MediaUploader = ({ images, video, onImagesChange, onVideoChange, getFileState = () => undefined }: Props) => {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 2 - images.length
    onImagesChange([...images, ...files.slice(0, remaining)])
    e.target.value = ""
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVideoChange(e.target.files?.[0] ?? null)
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-stone-700">
        写真・動画（任意：画像2枚・動画1本まで）
      </span>

      <div className="flex flex-wrap gap-3">
        {/* 選択済み画像のプレビュー */}
        {images.map((file, i) => (
          <div
            key={i}
            className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt={`写真${i + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            <UploadOverlay state={getFileState(file)} />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none z-10"
              aria-label={`写真${i + 1}を削除`}
            >
              ✕
            </button>
          </div>
        ))}

        {/* 画像追加ボタン（2枚未満のとき表示） */}
        {images.length < 2 && (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
          >
            <span className="text-2xl">🖼️</span>
            <span className="text-xs">写真を追加</span>
          </button>
        )}

        {/* 選択済み動画のプレビュー */}
        {video ? (
          <div className="relative w-24 h-24 rounded-xl border border-stone-200 bg-stone-50 flex flex-col items-center justify-center px-2 overflow-hidden">
            <span className="text-2xl">🎬</span>
            <p className="text-xs text-stone-500 text-center truncate w-full mt-1">
              {video.name}
            </p>
            <UploadOverlay state={getFileState(video)} />
            <button
              type="button"
              onClick={() => onVideoChange(null)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none z-10"
              aria-label="動画を削除"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
          >
            <span className="text-2xl">🎬</span>
            <span className="text-xs">動画を追加</span>
          </button>
        )}
      </div>

      <p className="text-xs text-stone-400">
        写真：JPG・PNG・WebP ／ 動画：MP4・MOV
      </p>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={handleVideoSelect}
      />
    </div>
  )
}

export default MediaUploader
