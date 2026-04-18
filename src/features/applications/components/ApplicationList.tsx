"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Avatar from "@/components/ui/Avatar"
import { Application } from "../types"

type Props = {
  postId: number
}

// 申請ステータスの表示設定
const statusLabel: Record<Application["status"], { text: string; className: string }> = {
  PENDING:  { text: "申請中",  className: "bg-amber-50 text-amber-800 border border-amber-200" },
  APPROVED: { text: "承認済み", className: "bg-green-50 text-green-800 border border-green-200" },
  REJECTED: { text: "却下",    className: "bg-stone-100 text-stone-500 border border-stone-200" },
}

// オーナー向け申請一覧・承認/却下コンポーネント
const ApplicationList = ({ postId }: Props) => {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // 申請一覧を取得する
  useEffect(() => {
    const fetch_ = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/posts/${postId}/applications`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications)
      }
      setIsLoading(false)
    }
    fetch_()
  }, [postId])

  // 承認 or 却下する
  const handleUpdate = async (applicationId: number, status: "APPROVED" | "REJECTED") => {
    setProcessingId(applicationId)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      )
    }
    setProcessingId(null)
  }

  if (isLoading) {
    return <p className="text-sm text-stone-400 text-center py-4">読み込み中...</p>
  }

  if (applications.length === 0) {
    return <p className="text-sm text-stone-500 text-center py-4">まだ申請はありません</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((app) => (
        <div key={app.id} className="flex flex-col gap-2 p-4 bg-stone-50 rounded-xl border border-stone-100">
          {/* ユーザー情報とステータス */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar name={app.user.name} avatarUrl={app.user.avatarUrl} size="sm" />
              <p className="text-sm font-medium text-stone-800">{app.user.name}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusLabel[app.status].className}`}>
              {statusLabel[app.status].text}
            </span>
          </div>

          {/* メッセージ */}
          {app.message && (
            <p className="text-xs text-stone-600 bg-white rounded-lg px-3 py-2 border border-stone-100 whitespace-pre-wrap">
              {app.message}
            </p>
          )}

          {/* 承認/却下ボタン（PENDING のみ表示） */}
          {app.status === "PENDING" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleUpdate(app.id, "REJECTED")}
                disabled={processingId === app.id}
                className="flex-1 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                却下
              </button>
              <button
                onClick={() => handleUpdate(app.id, "APPROVED")}
                disabled={processingId === app.id}
                className="flex-1 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-xs text-white font-bold transition-colors disabled:opacity-50"
              >
                {processingId === app.id ? "処理中..." : "承認"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ApplicationList
