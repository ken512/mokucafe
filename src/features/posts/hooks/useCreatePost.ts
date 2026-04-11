"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CreatePostRequest, CreatePostResponse } from "../types"

// 募集投稿作成 hook
export const useCreatePost = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = async (values: CreatePostRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      // Supabase セッションからアクセストークンを取得する
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("ログインが必要です")
        return
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "投稿に失敗しました")
        return
      }

      const data: CreatePostResponse = await res.json()
      // 投稿詳細ページへ遷移（シェア機能はそちらで提供する）
      router.push(`/posts/${data.post.id}`)
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください")
    } finally {
      setIsLoading(false)
    }
  }

  return { createPost, isLoading, error }
}
