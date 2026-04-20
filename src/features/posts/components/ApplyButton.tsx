"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ApplicationStatus } from "@/features/applications/types"
import Dialog from "@/components/ui/Dialog"

type FetchStatus = "loading" | "idle" | "submitting" | "error"

type Props = {
  postId: number
  isClosed: boolean
  isWorkFinished: boolean // 作業終了済みかどうか（終了後は参加確定不可）
}

// 申請ステータスのバッジ表示設定（APPROVED は参加確定ボタンを別途表示するため除外）
const statusBadgeConfig: Partial<Record<ApplicationStatus, { text: string; description: string; className: string }>> = {
  PENDING: {
    text: "申請中",
    description: "オーナーの承認をお待ちください",
    className: "bg-amber-50 border border-amber-200 text-amber-800",
  },
  ATTENDING: {
    text: "参加確定！",
    description: "参加が確定されました。当日楽しみましょう！",
    className: "bg-green-50 border border-green-200 text-green-800",
  },
  REJECTED: {
    text: "却下",
    description: "今回は参加できませんでした",
    className: "bg-stone-100 border border-stone-200 text-stone-500",
  },
}

// 参加申請ボタン（自分の申請ステータス表示付き）
const ApplyButton = ({ postId, isClosed, isWorkFinished }: Props) => {
  const [myStatus, setMyStatus] = useState<ApplicationStatus | null>(null)
  const [myApplicationId, setMyApplicationId] = useState<number | null>(null)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading")
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showFinishedDialog, setShowFinishedDialog] = useState(false)
  const [showFullDialog, setShowFullDialog] = useState(false)

  // マウント時に自分の申請ステータスを取得する
  useEffect(() => {
    const fetchMyApplication = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/posts/${postId}/applications/me`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMyStatus(data.application?.status ?? null)
        setMyApplicationId(data.application?.id ?? null)
      }
      setFetchStatus("idle")
    }
    fetchMyApplication()
  }, [postId])

  // 参加申請する
  const apply = async () => {
    setFetchStatus("submitting")
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/posts/${postId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ message: message.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        // 定員超過はダイアログで表示する
        if (res.status === 400 && data.error === "定員に達しています") {
          setShowFullDialog(true)
          setFetchStatus("idle")
          setShowForm(false)
          return
        }
        setErrorMessage(data.error ?? "申請に失敗しました")
        setFetchStatus("error")
        return
      }
      setMyStatus("PENDING")
      setFetchStatus("idle")
    } catch {
      setErrorMessage("申請に失敗しました")
      setFetchStatus("error")
    }
  }

  // 参加確定する（APPROVED → ATTENDING）
  const confirmAttendance = async () => {
    if (!myApplicationId) return
    // 作業終了後は参加確定不可
    if (isWorkFinished) {
      setShowFinishedDialog(true)
      return
    }
    setFetchStatus("submitting")
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/applications/${myApplicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ status: "ATTENDING" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error ?? "参加確定に失敗しました")
        setFetchStatus("error")
        return
      }
      setMyStatus("ATTENDING")
      setFetchStatus("idle")
    } catch {
      setErrorMessage("参加確定に失敗しました")
      setFetchStatus("error")
    }
  }

  // ローディング中
  if (fetchStatus === "loading") {
    return (
      <div className="w-full py-3 rounded-xl bg-stone-100 text-stone-400 text-sm text-center animate-pulse">
        読み込み中...
      </div>
    )
  }

  // 承認済み → 参加確定ボタンを表示
  if (myStatus === "APPROVED") {
    return (
      <>
        <Dialog
          isOpen={showFinishedDialog}
          onClose={() => setShowFinishedDialog(false)}
          variant="error"
          title="作業は終了しています"
          message="この募集の作業時間はすでに終了しているため、参加確定できません。"
        />
        <div className="flex flex-col gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-sm font-bold text-green-800">✅ 参加が承認されました！</p>
          <p className="text-xs text-green-700">参加が決まったら「参加する」を押して確定してください。</p>
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
          <button
            onClick={confirmAttendance}
            disabled={fetchStatus === "submitting"}
            className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {fetchStatus === "submitting" ? "確定中..." : "参加する"}
          </button>
        </div>
      </>
    )
  }

  // その他の申請済みステータス（PENDING / ATTENDING / REJECTED）はバッジ表示
  if (myStatus && statusBadgeConfig[myStatus]) {
    const config = statusBadgeConfig[myStatus]!
    return (
      <div className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-center ${config.className}`}>
        <p>{config.text}</p>
        <p className="text-xs font-normal mt-0.5">{config.description}</p>
      </div>
    )
  }

  // 募集終了
  if (isClosed) {
    return (
      <div className="w-full py-3 rounded-xl bg-stone-200 text-stone-500 text-sm font-bold text-center">
        受付終了
      </div>
    )
  }

  // フォーム表示前
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-full bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors"
      >
        参加申請する
      </button>
    )
  }

  // メッセージ入力フォーム
  return (
    <>
    <Dialog
      isOpen={showFullDialog}
      onClose={() => setShowFullDialog(false)}
      variant="error"
      title="参加申請できません"
      message="募集人数に達しているため、参加申請できません。"
    />
    <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
      <p className="text-sm font-medium text-stone-800">メッセージ（任意・500文字以内）</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="一言あれば入力してください"
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
          onClick={() => { setShowForm(false); setErrorMessage(null) }}
          className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={apply}
          disabled={fetchStatus === "submitting"}
          className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors disabled:opacity-50"
        >
          {fetchStatus === "submitting" ? "送信中..." : "申請する"}
        </button>
      </div>
    </div>
    </>
  )
}

export default ApplyButton
