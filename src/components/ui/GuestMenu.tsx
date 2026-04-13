"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ゲストユーザー用ドロップダウンメニュー
const GuestMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push("/")
    router.refresh()
  }

  return (
    <div ref={menuRef} className="relative">
      {/* ゲスト中バッジ（タップでメニューを開く） */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-xs font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors"
        aria-expanded={isOpen}
      >
        ゲスト中
        <span className="text-stone-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-lg border border-stone-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-stone-100 mb-1">
            <p className="text-xs text-stone-400">ゲストとして閲覧中</p>
          </div>

          <Link
            href="/signup"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-900 font-medium hover:bg-amber-50 transition-colors"
          >
            📝 新規登録する
          </Link>

          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            🔑 ログインする
          </Link>

          <hr className="border-stone-100 my-1" />

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            🚪 {isLoggingOut ? "終了中..." : "ゲストを終了する"}
          </button>
        </div>
      )}
    </div>
  )
}

export default GuestMenu
