"use client"

import { useState, useEffect, useRef } from "react"
import PostList from "./PostList"
import PostFilter from "./PostFilter"

// 募集一覧ページのクライアントコンポーネント（フィルター状態を管理する）
const PostsPageClient = () => {
  // 入力欄に表示する値（即時反映）
  const [q, setQ] = useState("")
  const [tag, setTag] = useState("")

  // APIに渡す値（デバウンス後に更新）
  const [debouncedQ, setDebouncedQ] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // q が変わるたびに 300ms デバウンスしてからAPIクエリを更新する
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  // タグはクリック操作なので即時反映でよい
  const handleTagChange = (value: string) => setTag(value)

  const handleQChange = (value: string) => {
    setQ(value)
    // クリアしたときは即座に反映する（デバウンス待ちにしない）
    if (!value) setDebouncedQ("")
  }

  return (
    <div className="flex flex-col gap-4">
      <PostFilter
        q={q}
        tag={tag}
        onQChange={handleQChange}
        onTagChange={handleTagChange}
      />
      <PostList q={debouncedQ || undefined} tag={tag || undefined} />
    </div>
  )
}

export default PostsPageClient
