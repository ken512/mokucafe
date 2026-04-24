"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Post } from "../types"
import ShareCard from "./ShareCard"

type Orientation = "portrait" | "landscape"
type Platform = "x" | "threads" | "instagram"

type UserSns = {
  xUrl: string | null
  threadsUrl: string | null
  instagramUrl: string | null
}

type Props = {
  post: Post
  userSns: UserSns
  onClose: () => void
}

const formatJST = (iso: string): string =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))

// 投稿情報からシェアテキストを生成する
const buildShareText = (post: Post, postUrl: string): string => {
  const tags = post.tags.map((t) => `#${t}`).join(" ")
  const date = formatJST(post.date)
  const end = post.endDate ? `〜${formatJST(post.endDate)}` : ""
  const remaining = Math.max(0, post.capacity - post.applicantCount)
  return [
    `☕ もくカフェで作業仲間を募集中！`,
    ``,
    `📍 ${post.cafeName}`,
    `📅 ${date}${end}`,
    `👥 残り${remaining}枠 / ${post.capacity}人`,
    ``,
    post.description,
    ...(tags ? [``, tags] : []),
    ``,
    `詳細・参加申請はこちら👇`,
    postUrl,
  ].join("\n")
}

const isMobile = (): boolean =>
  typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

// SNS シェアモーダル（シェアカード画像 + プラットフォーム別投稿）
const ShareModal = ({ post, userSns, onClose }: Props) => {
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [activePlatform, setActivePlatform] = useState<Platform>(
    userSns.xUrl ? "x" : userSns.threadsUrl ? "threads" : "instagram"
  )
  // キャプチャ済み画像の data URL（<img> として表示するため）
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCopiedText, setIsCopiedText] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 利用可能なプラットフォーム（SNS URL が設定済みのもの）
  const availablePlatforms: { key: Platform; label: string; icon: string }[] = [
    ...(userSns.xUrl ? [{ key: "x" as Platform, label: "X", icon: "𝕏" }] : []),
    ...(userSns.threadsUrl ? [{ key: "threads" as Platform, label: "Threads", icon: "🧵" }] : []),
    ...(userSns.instagramUrl ? [{ key: "instagram" as Platform, label: "Instagram", icon: "📸" }] : []),
  ]

  // ShareCard を html2canvas でキャプチャして data URL を返す
  const captureToDataUrl = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null
    setIsCapturing(true)
    setCapturedDataUrl(null)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      return canvas.toDataURL("image/png")
    } catch {
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  // モーダルを開いた時・向きを変えた時に自動キャプチャする
  useEffect(() => {
    // ShareCard が DOM に描画されるのを待つ
    const timer = setTimeout(async () => {
      const dataUrl = await captureToDataUrl()
      if (dataUrl) setCapturedDataUrl(dataUrl)
    }, 100)
    return () => clearTimeout(timer)
  }, [orientation, captureToDataUrl])

  // X / Threads へシェア（インテント URL を開く）
  const handleShare = async (platform: Platform) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    const text = buildShareText(post, postUrl)

    if (platform === "x") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        "_blank"
      )
    } else if (platform === "threads") {
      window.open(
        `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
        "_blank"
      )
    } else if (platform === "instagram") {
      // data URL を Blob に変換してシェアする
      if (capturedDataUrl) {
        const res = await fetch(capturedDataUrl)
        const blob = await res.blob()
        const file = new File([blob], "mokucafe.png", { type: "image/png" })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text })
          return
        }
      }
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // URLをコピーする
  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // シェア文をコピーする
  const handleCopyText = async () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    await navigator.clipboard.writeText(buildShareText(post, postUrl))
    setIsCopiedText(true)
    setTimeout(() => setIsCopiedText(false), 2000)
  }

  const saveHint = isMobile() ? "長押しで画像を保存できます" : "右クリックで画像を保存できます"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
          <p className="text-base font-bold text-stone-800">SNSでシェア</p>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* シェアカード + 縦横トグル */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex rounded-full border border-stone-200 overflow-hidden text-xs">
              {(["portrait", "landscape"] as Orientation[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={[
                    "px-4 py-1.5 transition-colors",
                    orientation === o
                      ? "bg-stone-800 text-white"
                      : "text-stone-600 hover:bg-stone-50",
                  ].join(" ")}
                >
                  {o === "portrait" ? "縦" : "横"}
                </button>
              ))}
            </div>

            {/* キャプチャ元：画面外に配置（html2canvas 用） */}
            <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }} aria-hidden>
              <ShareCard ref={cardRef} post={post} orientation={orientation} />
            </div>

            {/* 表示用：<img> として描画することで長押し・右クリック保存が可能になる */}
            <div className="flex justify-center">
              {isCapturing || !capturedDataUrl ? (
                <div
                  className="bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 text-sm"
                  style={{
                    width: orientation === "portrait" ? 270 : 405,
                    height: orientation === "portrait" ? 360 : 225,
                  }}
                >
                  画像を生成中...
                </div>
              ) : (
                <img
                  src={capturedDataUrl}
                  alt="シェアカード"
                  className="rounded-2xl shadow-sm"
                  style={{ width: orientation === "portrait" ? 270 : 405 }}
                  draggable
                />
              )}
            </div>
            <p className="text-xs text-stone-400">{saveHint}</p>
          </div>

          {/* プラットフォームタブ + シェアボタン */}
          {availablePlatforms.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xl">
                {availablePlatforms.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActivePlatform(key)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      activePlatform === key
                        ? "bg-white text-stone-800 shadow-sm"
                        : "text-stone-500 hover:text-stone-700",
                    ].join(" ")}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleShare(activePlatform)}
                disabled={isCapturing || !capturedDataUrl}
                className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isCapturing ? "準備中..." : (
                  activePlatform === "x" ? "𝕏 でポストする" :
                  activePlatform === "threads" ? "🧵 Threads に投稿する" :
                  "📸 Instagram にシェアする"
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 flex flex-col gap-2">
              <p className="text-sm text-stone-600">
                プロフィールにSNSリンクを登録すると<br />シェアボタンが表示されます
              </p>
              <a href="/profile" className="text-sm text-amber-900 underline underline-offset-2">
                プロフィールを編集する →
              </a>
            </div>
          )}

          {/* シェア文プレビュー＋コピー */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-stone-500">📋 コピペ用シェア文</p>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-700 leading-relaxed whitespace-pre-line select-all">
              {buildShareText(post, `${typeof window !== "undefined" ? window.location.origin : ""}/posts/${post.id}`)}
            </div>
            <button
              onClick={handleCopyText}
              className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {isCopiedText ? "✅ コピーしました" : "📋 シェア文をコピー"}
            </button>
          </div>

          {/* URLコピー */}
          <button
            onClick={handleCopyUrl}
            className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            {isCopied ? "✅ コピーしました" : "🔗 URLをコピー"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
