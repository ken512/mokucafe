"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// 募集投稿削除 hook
export const useDeletePost = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deletePost = async (postId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("ログインが必要です")
        return false
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "削除に失敗しました")
        return false
      }

      // 削除成功したらホームへ遷移する
      router.push("/")
      return true
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { deletePost, isLoading, error }
}
