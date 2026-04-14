"use client"

import { useState, useTransition, useDeferredValue } from "react"
import PostList from "./PostList"
import PostFilter from "./PostFilter"

// 募集一覧ページのクライアントコンポーネント（フィルター状態を管理する）
const PostsPageClient = () => {
  const [q, setQ] = useState("")
  const [tag, setTag] = useState("")
  const [, startTransition] = useTransition()

  // タイピング中にUIがカクつかないよう useDeferredValue で検索を遅延する
  const deferredQ = useDeferredValue(q)
  const deferredTag = useDeferredValue(tag)

  const handleQChange = (value: string) => {
    startTransition(() => setQ(value))
  }

  const handleTagChange = (value: string) => {
    startTransition(() => setTag(value))
  }

  return (
    <div className="flex flex-col gap-4">
      <PostFilter
        q={q}
        tag={tag}
        onQChange={handleQChange}
        onTagChange={handleTagChange}
      />
      <PostList q={deferredQ || undefined} tag={deferredTag || undefined} />
    </div>
  )
}

export default PostsPageClient
