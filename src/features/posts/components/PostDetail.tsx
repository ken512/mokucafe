"use client"

import Tag from "@/components/ui/Tag"
import Avatar from "@/components/ui/Avatar"
import ButtonLink from "@/components/ui/ButtonLink"
import CafeMap from "./CafeMap"
import ApplyButton from "./ApplyButton"
import MediaGallery from "./MediaGallery"
import { Post } from "../types"
import { useWorkStatus } from "../hooks/useWorkStatus"
import { getStatusDisplay } from "../utils/postStatus"

type Props = {
  post: Post
  isLoggedIn: boolean
  isOwner: boolean
}

// "2026-04-11T14:00:00Z" → "2026/4/11 14:00"
const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${y}/${m}/${d} ${hh}:${mm}`
}

// 募集投稿の詳細表示コンポーネント
// 表示順: メディア → 募集内容 → 地図 → ホスト → 申請/削除
const PostDetail = ({ post, isLoggedIn, isOwner }: Props) => {
  const remainingSlots = Math.max(0, post.capacity - post.applicantCount)
  const workStatus = useWorkStatus(post.date, post.endDate)

  return (
    <div className="flex flex-col gap-4">
      {/* 1. メディアギャラリー（写真・動画がある場合のみ表示） */}
      {post.mediaUrls.length > 0 && (
        <MediaGallery mediaUrls={post.mediaUrls} />
      )}

      {/* 2. カフェ情報・募集内容 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        {/* カフェ名・住所 */}
        <div>
          {post.cafeAddress && (
            <p className="text-xs text-amber-800 font-medium">{post.cafeAddress}</p>
          )}
          <h1 className="text-xl font-bold text-stone-800 mt-0.5">{post.cafeName}</h1>
        </div>

        {/* 日時・残枠・ステータス */}
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full">
            📅 {formatDate(post.date)}
            {post.endDate && ` 〜 ${formatDate(post.endDate)}`}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full">
            👥 残り{remainingSlots}枠 / {post.capacity}人
          </span>
          {workStatus && (
            <span className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${getStatusDisplay(workStatus).badgeClass}`}>
              {getStatusDisplay(workStatus).label}
            </span>
          )}
        </div>

        {/* 作業内容 */}
        <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>

        {/* タグ */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>

      {/* 3. 地図（住所がある場合のみ表示） */}
      {post.cafeAddress && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <p className="text-sm font-medium text-stone-700 px-4 pt-4 pb-2">
            カフェの場所
          </p>
          <CafeMap address={post.cafeAddress} cafeName={post.cafeName} placeId={post.cafePlaceId} />
        </div>
      )}

      {/* ホスト情報 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Avatar name={post.host.name} avatarUrl={post.host.avatarUrl} size="md" />
        <div>
          <p className="text-xs text-stone-500">ホスト</p>
          <p className="text-sm font-medium text-stone-800">{post.host.name}</p>
        </div>
      </div>

      {/* 参加申請（投稿者本人には表示しない） */}
      {!isOwner && (
        isLoggedIn ? (
          <ApplyButton postId={post.id} isClosed={post.status !== "OPEN" || remainingSlots === 0} />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ButtonLink href="/login" variant="primary" size="lg" fullWidth>
              ログインして参加申請する
            </ButtonLink>
            <p className="text-xs text-stone-500">参加申請にはログインが必要です</p>
          </div>
        )
      )}

    </div>
  )
}

export default PostDetail
