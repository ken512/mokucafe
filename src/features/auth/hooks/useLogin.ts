"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDialog } from "@/hooks/useDialog"
import { LoginFormValues } from "../types"

// ログイン処理hook
export const useLogin = () => {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dialog, isOpen, showDialog, closeDialog } = useDialog()

  const login = async ({ email, password }: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError("メールアドレスまたはパスワードが正しくありません")
        return
      }

      showDialog({
        title: "ログインしました！",
        message: "おかえりなさい ☕\nもくカフェへようこそ。",
        variant: "success",
        // フルリロードでサーバーコンポーネント（Header）のキャッシュを確実にクリアする
        onClose: () => { window.location.href = "/" },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error, dialog, isOpen, closeDialog }
}
