"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Post } from "../types"
import ShareCard from "./ShareCard"

type Orientation = "portrait" | "landscape"
type Platform = "x" | "threads" | "instagram"
type GeneratedTexts = { x: string; threads: string; instagram: string }

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

// SNS シェアモーダル（シェアカード画像 + プラットフォーム別投稿）
const ShareModal = ({ post, userSns, onClose }: Props) => {
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [activePlatform, setActivePlatform] = useState<Platform>(
    userSns.xUrl ? "x" : userSns.threadsUrl ? "threads" : "instagram"
  )
  const [texts, setTexts] = useState<GeneratedTexts | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 利用可能なプラットフォーム（SNS URL が設定済みのもの）
  const availablePlatforms: { key: Platform; label: string; icon: string }[] = [
    ...(userSns.xUrl ? [{ key: "x" as Platform, label: "X", icon: "𝕏" }] : []),
    ...(userSns.threadsUrl ? [{ key: "threads" as Platform, label: "Threads", icon: "🧵" }] : []),
    ...(userSns.instagramUrl ? [{ key: "instagram" as Platform, label: "Instagram", icon: "📸" }] : []),
  ]

  // モーダルを開いたときにシェア文を自動生成する
  useEffect(() => {
    const generate = async () => {
      setIsGenerating(true)
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch("/api/ai/generate-share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
          body: JSON.stringify({
            cafeName: post.cafeName,
            cafeAddress: post.cafeAddress,
            date: post.date,
            endDate: post.endDate,
            description: post.description,
            tags: post.tags,
          }),
        })
        const data = await res.json()
        if (res.ok) setTexts(data)
      } catch {
        // 生成失敗時はテキストなしのまま続行
      } finally {
        setIsGenerating(false)
      }
    }
    generate()
  }, [post])

  // シェアカードを画像として取得し Blob を返す
  const captureCard = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null
    setIsCapturing(true)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
    } catch {
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  // X / Threads へシェア（インテント URL を開く）
  const handleShare = async (platform: Platform) => {
    const text = texts?.[platform] ?? ""
    const postUrl = `${window.location.origin}/posts/${post.id}`
    const fullText = text.replace("[URL]", postUrl)

    if (platform === "x") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`,
        "_blank"
      )
    } else if (platform === "threads") {
      window.open(
        `https://www.threads.net/intent/post?text=${encodeURIComponent(fullText)}`,
        "_blank"
      )
    } else if (platform === "instagram") {
      // Instagram はWeb Share API 経由でネイティブシェアを開く
      const blob = await captureCard()
      if (blob && navigator.canShare?.({ files: [new File([blob], "mokucafe.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "mokucafe.png", { type: "image/png" })],
          text: fullText,
        })
      } else {
        // Web Share API 非対応環境ではURLをコピー
        await navigator.clipboard.writeText(fullText)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      }
    }
  }

  // URLをコピーする
  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const currentText = texts?.[activePlatform] ?? ""

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
            {/* 縦横トグル */}
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

            {/* カードプレビュー（スケールダウンして表示） */}
            {/* カード実寸 × スケールで外側サイズを固定し、クリップを防ぐ */}
            {(() => {
              // モーダル内側幅（max-w-md 448px - p-5×2 40px）に収まるスケールを算出する
              const cardW = orientation === "portrait" ? 360 : 560
              const cardH = orientation === "portrait" ? 480 : 320
              const scale = Math.min(0.75, 400 / cardW)
              return (
                <div style={{
                  width: cardW * scale,
                  height: cardH * scale,
                  overflow: "hidden",
                  position: "relative",
                  margin: "0 auto",
                }}>
                  <div style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}>
                    <ShareCard ref={cardRef} post={post} orientation={orientation} />
                  </div>
                </div>
              )
            })()}
            <p className="text-xs text-stone-400">画像を長押しして保存できます</p>
          </div>

          {/* プラットフォームタブ */}
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

              {/* シェア文（編集可能） */}
              {isGenerating ? (
                <p className="text-xs text-stone-400 text-center py-2">シェア文を生成中...</p>
              ) : texts && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-stone-600">
                    シェア文（編集できます）
                  </label>
                  <textarea
                    value={currentText}
                    onChange={(e) =>
                      setTexts((prev) =>
                        prev ? { ...prev, [activePlatform]: e.target.value } : prev
                      )
                    }
                    rows={5}
                    className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors w-full"
                  />
                  <p className="text-xs text-stone-400 text-right">{currentText.length}字</p>
                </div>
              )}

              {/* シェアボタン */}
              {texts && (
                <button
                  onClick={() => handleShare(activePlatform)}
                  disabled={isCapturing}
                  className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isCapturing ? "準備中..." : (
                    activePlatform === "x" ? "𝕏 でポストする" :
                    activePlatform === "threads" ? "🧵 Threads に投稿する" :
                    "📸 Instagram にシェアする"
                  )}
                </button>
              )}
            </div>
          ) : (
            // SNS 未設定の場合
            <div className="text-center py-4 flex flex-col gap-2">
              <p className="text-sm text-stone-600">
                プロフィールにSNSリンクを登録すると<br />シェアボタンが表示されます
              </p>
              <a
                href="/profile"
                className="text-sm text-amber-900 underline underline-offset-2"
              >
                プロフィールを編集する →
              </a>
            </div>
          )}

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
