import { Post } from "../types"
import Tag from "@/components/ui/Tag"
import Avatar from "@/components/ui/Avatar"
import ButtonLink from "@/components/ui/ButtonLink"

type Props = {
  post: Post
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

const PostCard = ({ post }: Props) => {
  const remainingSlots = Math.max(0, post.capacity - post.applicantCount)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* カード上部：グラデーションヘッダー */}
      <div className="h-28 bg-linear-to-br from-amber-800 to-amber-950 relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end justify-between p-3">
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {formatDate(post.date)}
          </span>
          <span className="text-white text-xs bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            残り{remainingSlots}枠
          </span>
        </div>
      </div>

      {/* カード下部：コンテンツ */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          {post.cafeAddress && (
            <p className="text-xs text-amber-800 font-medium">{post.cafeAddress}</p>
          )}
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
          <ButtonLink
            href={`/posts/${post.id}`}
            variant="primary"
            size="sm"
            className="shrink-0 ml-2"
          >
            詳細を見る
          </ButtonLink>
        </div>

        {/* 投稿者 */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <Avatar name={post.host.name} />
          <span className="text-sm text-stone-600">{post.host.name}</span>
        </div>
      </div>
    </div>
  )
}

export default PostCard
