"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useDialog } from "@/hooks/useDialog"
import { SignupFormValues } from "../types"

// サインアップ処理hook
export const useSignup = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dialog, isOpen, showDialog, closeDialog } = useDialog()

  const signup = async ({ email, password, displayName }: SignupFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("このメールアドレスはすでに登録されています")
        } else if (authError.message.includes("rate limit")) {
          setError("しばらく時間をおいてから再度お試しください（メール送信の上限に達しました）")
        } else {
          setError("登録に失敗しました。しばらく時間をおいて再度お試しください")
        }
        return
      }

      if (data.session) {
        // アプリDBのusersテーブルにユーザーを登録する
        await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({ name: displayName }),
        })

        // 初回登録フラグ：ホーム遷移後にPWAオンボーディングモーダルを表示する
        localStorage.setItem("pwa_onboarding_pending", "1")

        // メール確認不要の設定の場合：即ログインしてホームへ
        showDialog({
          title: "登録完了！",
          message: "アカウントを作成しました ☕\nもくカフェへようこそ！",
          variant: "success",
          onClose: () => {
            router.push("/")
            router.refresh()
          },
        })
      } else {
        // メール確認が必要な場合：確認メール案内
        // コールバック後にPWAオンボーディングモーダルを表示するためフラグをセットする
        localStorage.setItem("pwa_onboarding_pending", "1")
        showDialog({
          title: "確認メールを送りました！",
          message: `${email} に確認メールを送信しました。\nメール内のリンクをクリックして登録を完了してください。`,
          variant: "info",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { signup, isLoading, error, dialog, isOpen, closeDialog }
}
