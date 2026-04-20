"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 30

// 管理者ログインページ
const AdminLoginPage = () => {
  const router = useRouter()
  const [secret, setSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  // ロックアウト残り時間のカウントダウン
  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (left <= 0) {
        setLockedUntil(null)
        setAttempts(0)
        setRemaining(0)
        clearInterval(tick)
      } else {
        setRemaining(left)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [lockedUntil])

  const isLocked = remaining > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return

    setIsLoading(true)
    setError(null)

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    })

    if (res.ok) {
      router.push("/admin/dashboard")
    } else {
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)

      if (nextAttempts >= MAX_ATTEMPTS) {
        // ロックアウト
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000)
        setRemaining(LOCKOUT_SECONDS)
        setError(null)
      } else {
        setError(`パスワードが正しくありません（あと${MAX_ATTEMPTS - nextAttempts}回間違えるとロックされます）`)
      }
      setSecret("")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">

        {/* 戻るリンク */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors self-start"
        >
          ☕ ← もどる
        </Link>

        {/* ヘッダー */}
        <div className="text-center">
          <p className="text-3xl mb-2">☕</p>
          <h1 className="text-lg font-bold text-stone-800">管理者ログイン</h1>
          <p className="text-xs text-stone-400 mt-1">もくカフェ 管理画面</p>
        </div>

        {/* 管理者専用の注意書き */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800 font-medium text-center">
            🔒 この画面は管理者専用です
          </p>
          <p className="text-xs text-amber-700 text-center mt-0.5">
            権限のない方はログインできません
          </p>
        </div>

        {/* ロックアウト表示 */}
        {isLocked ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center flex flex-col gap-1">
            <p className="text-sm font-bold text-red-700">🔒 一時的にロックされています</p>
            <p className="text-xs text-red-600">
              {remaining}秒後に再試行できます
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-stone-700">管理者パスワード</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="管理者パスワードを入力"
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 pr-12 outline-none focus:ring-2 focus:ring-amber-900/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <span className="text-sm">{showSecret ? "🙈" : "👁️"}</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !secret}
              className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? "確認中..." : "ログイン"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminLoginPage
