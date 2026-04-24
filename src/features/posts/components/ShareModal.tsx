"use client"

import { useState } from "react"
import { Post } from "../types"

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

const ShareModal = ({ post, userSns, onClose }: Props) => {
  const [activePlatform, setActivePlatform] = useState<Platform>(
    userSns.xUrl ? "x" : userSns.threadsUrl ? "threads" : "instagram"
  )
  const [isCopied, setIsCopied] = useState(false)
  const [isCopiedText, setIsCopiedText] = useState(false)

  const availablePlatforms: { key: Platform; label: string; icon: string }[] = [
    ...(userSns.xUrl ? [{ key: "x" as Platform, label: "X", icon: "𝕏" }] : []),
    ...(userSns.threadsUrl ? [{ key: "threads" as Platform, label: "Threads", icon: "🧵" }] : []),
    ...(userSns.instagramUrl ? [{ key: "instagram" as Platform, label: "Instagram", icon: "📸" }] : []),
  ]

  const handleShare = async (platform: Platform) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    const text = buildShareText(post, postUrl)

    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
    } else if (platform === "threads") {
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`, "_blank")
    } else if (platform === "instagram") {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleCopyText = async () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    await navigator.clipboard.writeText(buildShareText(post, postUrl))
    setIsCopiedText(true)
    setTimeout(() => setIsCopiedText(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
          <p className="text-base font-bold text-stone-800">SNSでシェア</p>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none" aria-label="閉じる">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* SNS シェアボタン */}
          {availablePlatforms.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xl">
                {availablePlatforms.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActivePlatform(key)}
                    className={[
                      "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      activePlatform === key ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700",
                    ].join(" ")}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleShare(activePlatform)}
                className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors"
              >
                {activePlatform === "x" ? "𝕏 でポストする" :
                 activePlatform === "threads" ? "🧵 Threads に投稿する" :
                 isCopied ? "✅ テキストをコピーしました" : "📸 Instagram 用テキストをコピー"}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 flex flex-col gap-2">
              <p className="text-sm text-stone-600">プロフィールにSNSリンクを登録すると<br />シェアボタンが表示されます</p>
              <a href="/profile" className="text-sm text-amber-900 underline underline-offset-2">プロフィールを編集する →</a>
            </div>
          )}

          {/* コピペ用シェア文 */}
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
