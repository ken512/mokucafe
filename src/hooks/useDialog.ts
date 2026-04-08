"use client"

import { useState } from "react"

type Variant = "success" | "info" | "error"

type DialogState = {
  title: string
  message: string
  variant: Variant
  onClose?: () => void
}

// ダイアログの表示状態を管理する汎用hook
export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const showDialog = (state: DialogState) => setDialog(state)

  const closeDialog = () => {
    const onClose = dialog?.onClose
    setDialog(null)
    onClose?.()
  }

  return {
    dialog,
    isOpen: !!dialog,
    showDialog,
    closeDialog,
  }
}
