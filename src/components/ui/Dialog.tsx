"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Button from "./Button"

type Variant = "success" | "info" | "error"

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  variant?: Variant
  closeLabel?: string
}

const iconMap: Record<Variant, string> = {
  success: "✓",
  info:    "☕",
  error:   "!",
}

const iconBgMap: Record<Variant, string> = {
  success: "bg-green-100 text-green-700",
  info:    "bg-amber-100 text-amber-800",
  error:   "bg-red-100 text-red-600",
}

// 汎用ダイアログコンポーネント（document.bodyにポータルでマウント）
const Dialog = ({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  closeLabel = "OK",
}: Props) => {
  // ハイドレーション後にのみ Portal を描画する（SSR と不一致を防ぐ）
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* アイコン */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto ${iconBgMap[variant]}`}>
          {iconMap[variant]}
        </div>

        {/* テキスト */}
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-base font-bold text-stone-800">{title}</h2>
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* 閉じるボタン */}
        <Button variant="primary" fullWidth onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    </div>,
    document.body
  )
}

export default Dialog
