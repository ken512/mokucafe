"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SignupFormValues } from "../types"

// サインアップ処理hook
export const useSignup = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signup = async ({ email, password, displayName }: SignupFormValues) => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (authError) {
      // すでに登録済みのメールアドレスの場合
      if (authError.message.includes("already registered")) {
        setError("このメールアドレスはすでに登録されています")
      } else {
        setError("登録に失敗しました。しばらく時間をおいて再度お試しください")
      }
      setIsLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return { signup, isLoading, error }
}
