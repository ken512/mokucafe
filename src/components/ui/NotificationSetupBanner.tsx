"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Platform = "ios-browser" | "android" | "other"

// プラットフォームを判定する
const detectPlatform = (): Platform => {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  if (isIOS) return "ios-browser"
  if (isAndroid) return "android"
  return "other"
}

// ホーム画面から起動中（standalone）かどうか
const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)

const DISMISSED_KEY = "notification_banner_dismissed"

// 通知設定を促すバナー（ログイン済みユーザー向け）
const NotificationSetupBanner = () => {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [isDismissed, setIsDismissed] = useState(true) // 初期は非表示（クライアントで判定後に切り替え）
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    // 既に閉じた場合は表示しない
    if (localStorage.getItem(DISMISSED_KEY)) return

    const p = detectPlatform()

    // iOS でホーム画面から起動済み → 通知は既に設定可能 → 表示しない
    if (p === "ios-browser" && isStandalone()) return

    // Android で既に通知許可済み → 表示しない
    if (p === "android" && "Notification" in window && Notification.permission === "granted") return

    // PC（other）は対象外
    if (p === "other") return

    setPlatform(p)
    setIsDismissed(false)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1")
    setIsDismissed(true)
  }

  // Android: 通知許可ボタンを押す
  const requestAndroidNotification = async () => {
    if (!("Notification" in window)) return
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      // PushSubscriptionManager と同じ購読処理を行う
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        if (!existing) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (vapidKey) {
            const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4)
            const b64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/")
            const raw = atob(b64)
            const key = Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
            const sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: key as unknown as ArrayBuffer,
            })
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(sub),
              })
            }
          }
        }
      } catch (e) {
        console.error("通知設定エラー:", e)
      }
      dismiss()
    }
  }

  if (isDismissed || !platform) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <p className="text-sm font-bold text-stone-800">通知を受け取ろう</p>
        </div>
        <button
          onClick={dismiss}
          className="text-stone-400 hover:text-stone-600 text-lg leading-none"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      {/* iOS 向け：ホーム画面追加の手順 */}
      {platform === "ios-browser" && (
        <>
          <p className="text-xs text-stone-700 leading-relaxed">
            iOSでは、ホーム画面に追加することで参加申請・承認などの通知がスマホに届くようになります。
          </p>
          <button
            onClick={() => setShowIosSteps(!showIosSteps)}
            className="text-xs font-medium text-amber-900 underline text-left"
          >
            {showIosSteps ? "手順を閉じる" : "📲 ホーム画面への追加手順を見る"}
          </button>
          {showIosSteps && (
            <ol className="flex flex-col gap-2">
              {[
                { step: "1", icon: "📤", text: "Safari 下部の「共有」ボタン（□↑）をタップ" },
                { step: "2", icon: "➕", text: "「ホーム画面に追加」を選択" },
                { step: "3", icon: "✅", text: "「追加」をタップして完了" },
                { step: "4", icon: "🏠", text: "ホーム画面のアイコンからアプリを起動すると通知が届くようになります" },
              ].map(({ step, icon, text }) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <p className="text-xs text-stone-700">
                    <span className="mr-1">{icon}</span>{text}
                  </p>
                </li>
              ))}
            </ol>
          )}
          <button
            onClick={dismiss}
            className="text-xs text-stone-400 text-left"
          >
            今は設定しない
          </button>
        </>
      )}

      {/* Android 向け：通知許可ボタン */}
      {platform === "android" && (
        <>
          <p className="text-xs text-stone-700 leading-relaxed">
            参加申請・承認・却下などをスマホ通知でお知らせします。
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestAndroidNotification}
              className="flex-1 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-colors"
            >
              通知を許可する
            </button>
            <button
              onClick={dismiss}
              className="flex-1 py-2 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
            >
              今はしない
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationSetupBanner
