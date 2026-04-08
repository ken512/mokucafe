"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Button from "@/components/ui/Button"

// ログアウトボタン（クライアントコンポーネント）
const LogoutButton = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={isLoading}
      loadingText="..."
      onClick={logout}
    >
      ログアウト
    </Button>
  )
}

export default LogoutButton
