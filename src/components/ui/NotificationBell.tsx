"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AppNotification = {
  id: number
  title: string
  body: string
  postId: number | null
  isRead: boolean
  createdAt: string
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  // チェック中のID一覧
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const getSession = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  const fetchNotifications = useCallback(async () => {
    const session = await getSession()
    if (!session) return
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    // セッション確立後に取得する（ページロード直後はgetSession()がnullを返す場合があるため）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchNotifications()
    })
    fetchNotifications()
    const timer = setInterval(fetchNotifications, 30_000)
    return () => {
      subscription.unsubscribe()
      clearInterval(timer)
    }
  }, [fetchNotifications])

  // PwaOnboardingModal などから通知作成後に即時更新する
  useEffect(() => {
    const handler = () => fetchNotifications()
    window.addEventListener("notifications:refresh", handler)
    return () => window.removeEventListener("notifications:refresh", handler)
  }, [fetchNotifications])

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ドロップダウンを閉じたときにチェックをリセット
  useEffect(() => {
    if (!isOpen) setSelectedIds(new Set())
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleOpen = async () => {
    const next = !isOpen
    setIsOpen(next)
    // 開いたとき未読を既読にする
    if (next && unreadCount > 0) {
      const session = await getSession()
      if (!session) return
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }
  }

  // 通知本文クリック → 投稿ページへ遷移
  const handleClickBody = (n: AppNotification) => {
    if (n.postId) {
      setIsOpen(false)
      router.push(`/posts/${n.postId}`)
    }
  }

  // チェックボックスの操作
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // すべて選択 / 解除
  const isAllSelected = notifications.length > 0 && selectedIds.size === notifications.length
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)))
    }
  }

  // 選択した通知を削除
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    const session = await getSession()
    if (!session) { setIsDeleting(false); return }
    const ids = Array.from(selectedIds)
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ ids }),
    })
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)))
      setSelectedIds(new Set())
    }
    setIsDeleting(false)
  }

  // 一括削除（全件）
  const deleteAll = async () => {
    setIsDeleting(true)
    const session = await getSession()
    if (!session) { setIsDeleting(false); return }
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      setNotifications([])
      setSelectedIds(new Set())
    }
    setIsDeleting(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ベルボタン */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
        aria-label="通知"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-17 max-h-[calc(100dvh-5rem)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-h-128 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 flex flex-col">

          {/* ヘッダー行 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              {/* すべて選択チェックボックス */}
              {notifications.length > 0 && (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-amber-900 cursor-pointer"
                  aria-label="すべて選択"
                />
              )}
              <p className="text-sm font-bold text-stone-800">通知</p>
            </div>

            {/* 一括削除ボタン */}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                disabled={isDeleting}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                一括削除
              </button>
            )}
          </div>

          {/* 通知一覧 */}
          {notifications.length === 0 ? (
            <p className="text-sm text-stone-400 px-4 py-8 text-center">通知はありません</p>
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <ul className="flex-1 overflow-y-auto divide-y divide-stone-50">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      selectedIds.has(n.id) ? "bg-amber-50/70" : n.isRead ? "bg-white" : "bg-amber-50"
                    }`}
                  >
                    {/* チェックボックス */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                      className="mt-1 w-4 h-4 shrink-0 accent-amber-900 cursor-pointer"
                    />

                    {/* 本文（投稿がある場合はタップで遷移） */}
                    <button
                      onClick={() => handleClickBody(n)}
                      className={`flex-1 text-left min-w-0 ${n.postId ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {!n.isRead && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-amber-600" />
                        )}
                        <p className="text-sm font-medium text-stone-800 leading-snug">{n.title}</p>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed whitespace-pre-line">
                        {n.body}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">{formatDate(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>

              {/* 選択削除バー（1件以上選択時に表示） */}
              {selectedIds.size > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50">
                  <p className="text-xs text-stone-600">
                    {selectedIds.size}件を選択中
                  </p>
                  <button
                    onClick={deleteSelected}
                    disabled={isDeleting}
                    className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "削除中..." : "選択を削除"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
