"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CreatePostRequest, CreatePostResponse } from "../types"

type CreatePostInput = Omit<CreatePostRequest, "mediaUrls"> & {
  // アップロード済みメディアURL（useEagerUpload で事前アップロード済み）
  mediaUrls: string[]
}

// 募集投稿作成 hook（メディアアップロードは useEagerUpload で事前に完了している前提）
export const useCreatePost = () => {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 投稿成功時に遷移先IDを保持する（nullのときは未完了）
  const [successPostId, setSuccessPostId] = useState<number | null>(null)

  const createPost = async (input: CreatePostInput) => {
    setIsLoading(true)
    setError(null)

    try {
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
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "投稿に失敗しました")
        return
      }

      const data: CreatePostResponse = await res.json()
      setSuccessPostId(data.post.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました。時間をおいて再度お試しください")
    } finally {
      setIsLoading(false)
    }
  }

  return { createPost, isLoading, error, successPostId }
}
