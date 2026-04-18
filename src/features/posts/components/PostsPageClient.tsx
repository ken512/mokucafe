"use client"

import { useState, useEffect, useRef } from "react"
import PostList from "./PostList"
import PostFilter from "./PostFilter"
import { createClient } from "@/lib/supabase/client"
import { ApplicationStatus } from "@/features/applications/types"

// 自分の申請一覧を取得してpostId→statusのmapにする
const fetchMyApplications = async (): Promise<Record<number, ApplicationStatus>> => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}

  const res = await fetch("/api/applications/me", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) return {}

  const data = await res.json()
  const map: Record<number, ApplicationStatus> = {}
  for (const a of data.applications) {
    map[a.postId] = a.status
  }
  return map
}

// 募集一覧ページのクライアントコンポーネント（フィルター状態を管理する）
const PostsPageClient = () => {
  // 入力欄に表示する値（即時反映）
  const [q, setQ] = useState("")
  const [tag, setTag] = useState("")
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | "">("")

  // APIに渡す値（デバウンス後に更新）
  const [debouncedQ, setDebouncedQ] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 自分の申請一覧（postId → status）
  const [myApplications, setMyApplications] = useState<Record<number, ApplicationStatus>>({})

  // マウント時に自分の申請一覧を取得する
  useEffect(() => {
    fetchMyApplications().then(setMyApplications)
  }, [])

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

  const hasApplications = Object.keys(myApplications).length > 0

  return (
    <div className="flex flex-col gap-4">
      <PostFilter
        q={q}
        tag={tag}
        applicationStatus={applicationStatus}
        hasApplications={hasApplications}
        onQChange={handleQChange}
        onTagChange={handleTagChange}
        onApplicationStatusChange={setApplicationStatus}
      />
      <PostList
        q={debouncedQ || undefined}
        tag={tag || undefined}
        myApplications={myApplications}
        applicationStatusFilter={applicationStatus || undefined}
      />
    </div>
  )
}

export default PostsPageClient
