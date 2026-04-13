"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"

type Props = {
  variant?: "primary" | "outline" | "ghost" | "hero"
  size?: "sm" | "md" | "lg"
}

// ログアウトボタン（クライアントコンポーネント）
const LogoutButton = ({ variant = "ghost", size = "md" }: Props) => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logout = async () => {
    setIsLoading(true)
    setError(null)

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError("ログアウトに失敗しました")
      setIsLoading(false)
      return
    }

    // 成功時はリダイレクトでコンポーネントがアンマウントされるため setIsLoading 不要
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={variant}
        size={size}
        isLoading={isLoading}
        loadingText="..."
        onClick={logout}
      >
        ログアウト
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default LogoutButton
