"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LoginFormValues } from "../types"

// ログイン処理hook
export const useLogin = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async ({ email, password }: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setIsLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return { login, isLoading, error }
}
