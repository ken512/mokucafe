"use client"

import { useState } from "react"
import { useApply } from "../hooks/useApply"

type Props = {
  postId: number
  isLoggedIn: boolean
  isClosed: boolean
}

// 参加申請ボタン（メッセージ入力付き）
const ApplyButton = ({ postId, isLoggedIn, isClosed }: Props) => {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const { status, errorMessage, apply } = useApply(postId)

  // 未ログイン
  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="block w-full text-center py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors"
      >
        ログインして参加申請する
      </a>
    )
  }

  // 募集終了・定員
  if (isClosed) {
    return (
      <div className="w-full py-3 rounded-xl bg-stone-200 text-stone-500 text-sm font-bold text-center">
        受付終了
      </div>
    )
  }

  // 申請完了
  if (status === "applied") {
    return (
      <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold text-center">
        ✅ 申請しました！オーナーの承認をお待ちください
      </div>
    )
  }

  // フォーム表示前
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors"
      >
        参加申請する
      </button>
    )
  }

  // メッセージ入力フォーム
  return (
    <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
      <p className="text-sm font-medium text-stone-800">メッセージ（任意）</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="一言あれば入力してください（500文字以内）"
        maxLength={500}
        rows={3}
        className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors w-full bg-white"
      />
      <p className="text-xs text-stone-400 text-right">{message.length}/500</p>
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={() => apply(message || undefined)}
          disabled={status === "loading"}
          className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "送信中..." : "申請する"}
        </button>
      </div>
    </div>
  )
}

export default ApplyButton
