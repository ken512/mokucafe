"use client"

import { useGuestLogin } from "../hooks/useGuestLogin"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"

type Props = {
  // "form": ログイン・登録ページ内（区切り線・説明文あり）
  // "hero": ヒーローセクション内（テキストリンク風）
  variant?: "form" | "hero"
}

// ゲストとして試すボタン
const GuestLoginButton = ({ variant = "form" }: Props) => {
  const { loginAsGuest, isLoading, error, dialog, isOpen, closeDialog } = useGuestLogin()

  return (
    <>
      {variant === "hero" ? (
        <div className="flex flex-col gap-1">
          <button
            onClick={loginAsGuest}
            disabled={isLoading}
            className="self-start text-sm text-white/70 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? "準備中..." : "まずはゲストで試す →"}
          </button>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-500">または</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <Button
            variant="ghost"
            fullWidth
            size="md"
            isLoading={isLoading}
            loadingText="準備中..."
            onClick={loginAsGuest}
          >
            ゲストとして試す（登録不要）
          </Button>

          {error && <p className="text-xs text-red-600 text-center">{error}</p>}

          <p className="text-xs text-stone-500 text-center">
            募集の閲覧・参加申請をお試しいただけます
          </p>
        </div>
      )}

      {dialog && (
        <Dialog
          isOpen={isOpen}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
        />
      )}
    </>
  )
}

export default GuestLoginButton
