import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type ApplyStatus = "idle" | "loading" | "applied" | "error"

// 参加申請を送信するフック
export const useApply = (postId: number) => {
  const [status, setStatus] = useState<ApplyStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const apply = async (message?: string) => {
    setStatus("loading")
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/posts/${postId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error ?? "申請に失敗しました")
        setStatus("error")
        return
      }
      setStatus("applied")
    } catch {
      setErrorMessage("申請に失敗しました")
      setStatus("error")
    }
  }

  return { status, errorMessage, apply }
}
