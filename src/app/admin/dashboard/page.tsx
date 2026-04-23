"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// 管理者ダッシュボード
const AdminDashboardPage = () => {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ sent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setResult(null)
    setError(null)

    // Cookie 認証に統一（prompt() 廃止 / Bearer トークン廃止）
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    })

    if (res.ok) {
      const data = await res.json()
      setResult(data)
      setTitle("")
      setBody("")
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "送信に失敗しました")
    }
    setIsSending(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-stone-100">

      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
            >
              ☕ ← もどる
            </a>
          </div>
          <div>
            <p className="text-xs text-stone-400">管理画面</p>
            <p className="text-base font-bold text-stone-800">☕ もくカフェ</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? "ログアウト中..." : "🚪 ログアウト"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ブロードキャスト通知 */}
        <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-800">📢 一斉通知を送る</h2>
            <p className="text-xs text-stone-400 mt-0.5">全ユーザーのお知らせベルに通知を送信します</p>
          </div>

          <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：🎉 新機能のお知らせ"
                required
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-900/30 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">本文</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="例：新しい機能が追加されました！詳しくはホーム画面をご確認ください。"
                required
                rows={4}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-900/30 transition resize-none"
              />
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm font-bold text-green-800">
                  ✅ {result.sent}人に送信しました
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !title || !body}
              className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isSending ? "送信中..." : "📢 全ユーザーに送信する"}
            </button>
          </form>
        </section>

      </main>
    </div>
  )
}

export default AdminDashboardPage
