"use client"

import PostCard from "./PostCard"
import { usePosts } from "../hooks/usePosts"

// 募集一覧（クライアントコンポーネント）
const PostList = () => {
  const { posts, isLoading } = usePosts()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="h-28 bg-stone-200" />
            <div className="p-4 flex flex-col gap-2">
              <div className="h-3 bg-stone-200 rounded w-1/3" />
              <div className="h-4 bg-stone-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p className="text-4xl mb-3">☕</p>
        <p className="text-sm">今日の募集はまだありません</p>
        <p className="text-sm mt-1">最初の募集を投稿してみましょう！</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default PostList
