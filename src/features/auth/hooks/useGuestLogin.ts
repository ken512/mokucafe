"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useDialog } from "@/hooks/useDialog"

// ゲストログイン（匿名認証）hook
export const useGuestLogin = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dialog, isOpen, showDialog, closeDialog } = useDialog()

  const loginAsGuest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInAnonymously()

      if (authError) {
        setError("ゲストログインに失敗しました。しばらく時間をおいて再度お試しください")
        return
      }

      showDialog({
        title: "ゲストでログインしました！",
        message: "募集の閲覧・参加申請をお試しいただけます ☕\n気に入ったら登録してみてください。",
        variant: "info",
        onClose: () => {
          router.push("/")
          router.refresh()
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { loginAsGuest, isLoading, error, dialog, isOpen, closeDialog }
}
