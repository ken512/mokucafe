"use client"

import Image from "next/image"
import { Post } from "../types"
import Tag from "@/components/ui/Tag"
import Avatar from "@/components/ui/Avatar"
import ButtonLink from "@/components/ui/ButtonLink"
import { useWorkStatus } from "../hooks/useWorkStatus"
import { getStatusDisplay } from "../utils/postStatus"
import { ApplicationStatus } from "@/features/applications/types"

// URLが動画ファイルかどうかを判定する
const isVideoUrl = (url: string) => /\.(mp4|mov|quicktime)$/i.test(url)

// 申請ステータスのバッジ表示設定
const applicationStatusConfig: Record<ApplicationStatus, { text: string; icon: string; className: string }> = {
  PENDING:  { text: "申請中",  icon: "⏳", className: "bg-amber-50 text-amber-800 border border-amber-200" },
  APPROVED: { text: "承認済み", icon: "✅", className: "bg-green-50 text-green-800 border border-green-200" },
  REJECTED: { text: "却下",    icon: "✕",  className: "bg-stone-100 text-stone-500 border border-stone-200" },
}

type Props = {
  post: Post
  myApplicationStatus?: ApplicationStatus
}

// "2026-04-11T14:00:00Z" → "4/11 14:00"
const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${month}/${day} ${hours}:${minutes}`
}

const PostCard = ({ post, myApplicationStatus }: Props) => {
  const remainingSlots = Math.max(0, post.capacity - post.applicantCount)
  // 画像URLを先頭から探す（動画は除く）
  const thumbnailUrl = post.mediaUrls.find((url) => !isVideoUrl(url))
  // リアルタイムステータス（endDate がない場合は undefined）
  const workStatus = useWorkStatus(post.date, post.endDate)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* カード上部：投稿写真 or グラデーションヘッダー */}
      <div className="h-28 relative">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${post.cafeName}の写真`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-amber-800 to-amber-950" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end justify-between p-3">
          {/* 開始〜終了の期間表示 */}
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {formatDate(post.date)}
            {post.endDate && ` 〜 ${formatDate(post.endDate)}`}
          </span>
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            残り{remainingSlots}枠
          </span>
        </div>
      </div>

      {/* カード下部：コンテンツ */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {post.cafeAddress && (
              <p className="text-xs text-amber-800 font-medium">{post.cafeAddress}</p>
            )}
            <h2 className="text-base font-bold text-stone-800 mt-0.5">{post.cafeName}</h2>
          </div>
          {/* リアルタイムステータスバッジ */}
          {workStatus && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getStatusDisplay(workStatus).badgeClass}`}>
              {getStatusDisplay(workStatus).label}
            </span>
          )}
        </div>

        <p className="text-sm text-stone-800 leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {/* タグ＋詳細ボタン */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <ButtonLink
            href={`/posts/${post.id}`}
            variant="primary"
            size="sm"
            className="shrink-0 ml-2"
          >
            詳細を見る
          </ButtonLink>
        </div>

        {/* 投稿者＋申請ステータス */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <Avatar name={post.host.name} avatarUrl={post.host.avatarUrl} />
            <span className="text-sm text-stone-600">{post.host.name}</span>
          </div>
          {myApplicationStatus && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${applicationStatusConfig[myApplicationStatus].className}`}>
              <span>{applicationStatusConfig[myApplicationStatus].icon}</span>
              <span>{applicationStatusConfig[myApplicationStatus].text}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostCard
