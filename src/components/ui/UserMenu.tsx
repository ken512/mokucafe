"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Props = {
  name: string
  avatarUrl: string | null
  isAdmin?: boolean
}

// ヘッダー右上のユーザーアイコン＋プルダウンメニュー
const UserMenu = ({ name, avatarUrl, isAdmin = false }: Props) => {
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

  const initial = name ? name.charAt(0).toUpperCase() : "?"

  return (
    <div ref={menuRef} className="relative">
      {/* アバターボタン */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-stone-200 hover:border-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-amber-900 text-white text-sm font-bold">
            {initial}
          </div>
        )}
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-stone-100 py-2 z-50">
          {/* ユーザー名 */}
          <div className="px-4 py-2 border-b border-stone-100 mb-1">
            <p className="text-xs text-stone-500">ログイン中</p>
            <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
          </div>

          <Link
            href="/posts"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            📋 募集一覧
          </Link>

          <Link
            href="/posts/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            ✏️ 募集を投稿する
          </Link>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            👤 プロフィール
          </Link>

          {/* 管理者ログイン済みはダッシュボード、未ログインはログインページへ */}
          <Link
            href={isAdmin ? "/admin/dashboard" : "/admin"}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            ⚙️ 管理画面
          </Link>

          <hr className="border-stone-100 my-1" />

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            🚪 {isLoggingOut ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
