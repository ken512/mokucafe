"use client"

import { useState, useRef } from "react"
import Image from "next/image"

type Props = {
  mediaUrls: string[]
}

const isVideoUrl = (url: string) => /\.(mp4|mov|quicktime)$/i.test(url)

// 写真・動画のギャラリーUI
// - メイン表示エリア（大）＋サムネイル一覧（下部）
// - 動画は再生ボタンをオーバーレイ表示し、クリックで再生
const MediaGallery = ({ mediaUrls }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (mediaUrls.length === 0) return null

  const currentUrl = mediaUrls[currentIndex]
  const isCurrentVideo = isVideoUrl(currentUrl)

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
  }

  const handlePlayClick = () => {
    setIsPlaying(true)
    // 少し遅らせてからautoPlayが効くようにする
    setTimeout(() => videoRef.current?.play(), 50)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* メイン表示エリア */}
      <div className="relative aspect-video bg-black">
        {/* 枚数カウンター */}
        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {currentIndex + 1} / {mediaUrls.length}
        </div>

        {isCurrentVideo ? (
          <>
            {/* 動画プレイヤー（常にレンダリングして再生状態を保持する） */}
            <video
              ref={videoRef}
              src={currentUrl}
              controls={isPlaying}
              className="w-full h-full object-contain"
            />
            {/* 未再生の間は再生ボタンをオーバーレイ表示する */}
            {!isPlaying && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                aria-label="動画を再生する"
              >
                {/* 再生ボタン（円＋三角） */}
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/70 flex items-center justify-center">
                  {/* 三角形（CSSボーダートリック） */}
                  <div className="w-0 h-0 border-t-[11px] border-b-[11px] border-l-[20px] border-t-transparent border-b-transparent border-l-white ml-1.5" />
                </div>
              </button>
            )}
          </>
        ) : (
          <Image
            src={currentUrl}
            alt={`写真${currentIndex + 1}`}
            fill
            className="object-contain"
            unoptimized
          />
        )}
      </div>

      {/* サムネイル一覧（複数枚のときのみ表示） */}
      {mediaUrls.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {mediaUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={[
                "relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === currentIndex
                  ? "border-amber-900 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80",
              ].join(" ")}
              aria-label={`${i + 1}枚目を表示`}
            >
              {isVideoUrl(url) ? (
                /* 動画サムネイルは再生アイコン付きプレースホルダー */
                <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[12px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`サムネイル${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaGallery
