import Image from "next/image"
import { Post } from "../types"
import Tag from "@/components/ui/Tag"
import Avatar from "@/components/ui/Avatar"
import ButtonLink from "@/components/ui/ButtonLink"

type Props = {
  post: Post
}

const PostCard = ({ post }: Props) => {
  const remainingSlots = Math.max(0, post.maxParticipants - post.currentParticipants)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* カード上部：カフェ写真 or グラデーションフォールバック */}
      <div className="h-28 bg-gradient-to-br from-amber-800 to-amber-950 relative">
        {post.cafeImageUrl && (
          <Image
            src={post.cafeImageUrl}
            alt={post.cafeName}
            fill
            className="object-cover"
          />
        )}
        {/* 写真上のオーバーレイ（文字の視認性確保） */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end justify-between p-3">
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {post.startTime} 〜 {post.endTime}
          </span>
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            残り{remainingSlots}枠
          </span>
        </div>
      </div>

      {/* カード下部：コンテンツ */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <p className="text-xs text-amber-800 font-medium">{post.cafeAddress}</p>
          <h2 className="text-base font-bold text-stone-800 mt-0.5">{post.cafeName}</h2>
        </div>

        <p className="text-sm text-stone-800 leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {/* タグ＋詳細ボタン */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1.5 flex-wrap">
            {post.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <ButtonLink href={`/posts/${post.id}`} variant="primary" size="sm" className="shrink-0 ml-2">
            詳細を見る
          </ButtonLink>
        </div>

        {/* 投稿者 */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <Avatar name={post.hostName} />
          <span className="text-sm text-stone-600">{post.hostName}</span>
        </div>
      </div>
    </div>
  )
}

export default PostCard
