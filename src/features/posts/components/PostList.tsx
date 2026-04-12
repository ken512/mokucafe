"use client"

import { useEffect, useRef } from "react"
import PostCard from "./PostCard"
import { usePosts } from "../hooks/usePosts"
import ErrorAlert from "@/components/ui/ErrorAlert"

// スケルトンカード（ローディング時に表示）
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="h-28 bg-stone-200" />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-3 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-2/3" />
      <div className="h-3 bg-stone-200 rounded w-full" />
    </div>
  </div>
)

// 募集一覧（無限スクロール対応）
const PostList = () => {
  const { posts, isLoading, error, isLoadingMore, hasMore, loadMore } =
    usePosts()

  // センチネルdivがビューポートに入ったら次のページを取得する
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      // 末尾の200px手前でプリフェッチして体感速度を上げる
      { rootMargin: "200px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMore])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message="募集の取得に失敗しました" />
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

      {/* センチネル：このdivが画面内に入ったら loadMore を発火する */}
      <div ref={sentinelRef} />

      {isLoadingMore && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
    </div>
  )
}

export default PostList
