"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Platform = "ios" | "android" | "other"

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  if (/android/i.test(ua)) return "android"
  return "other"
}

const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)

const IOS_STEPS = [
  { icon: "📤", text: 'Safari 下部の「共有」ボタン（□↑）をタップ' },
  { icon: "➕", text: '「ホーム画面に追加」を選択' },
  { icon: "✅", text: '「追加」をタップして完了' },
  { icon: "🏠", text: "ホーム画面のアイコンからアプリを開くと通知が届くようになります" },
]

// 新規登録後の初回表示：PWAホーム画面追加を案内するモーダル
const PwaOnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>("other")
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // メール確認フロー経由の新規ユーザー：URLパラメータからフラグをセットしてURLをクリーンアップする
    const params = new URLSearchParams(window.location.search)
    if (params.get("new_user") === "1") {
      localStorage.setItem("pwa_onboarding_pending", "1")
      params.delete("new_user")
      const cleanUrl = params.toString() ? `?${params}` : window.location.pathname
      window.history.replaceState({}, "", cleanUrl)
    }


    // フラグがある場合のみ処理する
    if (!localStorage.getItem("pwa_onboarding_pending")) return

    const p = detectPlatform()
    setPlatform(p)

    // PC はモーダルを表示しないが、ウェルカム通知は作成する
    if (p === "other") {
      localStorage.removeItem("pwa_onboarding_pending")
      createWelcomeNotification("other")
      return
    }

    // iOS でスタンドアロン済みはモーダルを表示しないが、ウェルカム通知は作成する
    if (p === "ios" && isStandalone()) {
      localStorage.removeItem("pwa_onboarding_pending")
      createWelcomeNotification("ios")
      return
    }

    setIsOpen(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // プラットフォーム別のウェルカム通知をアプリ内に作成し、通知ベルを即時更新する
  const createWelcomeNotification = async (p: Platform) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const title = "📲 スマホ通知を受け取ろう"
      const notifBody =
        "参加申請・承認・却下などをお知らせします。\n\n" +
        "【iPhone】\n" +
        "Safari下部の「共有」ボタン（□↑）→「ホーム画面に追加」→「追加」をタップ。\n" +
        "ホーム画面のアイコンから起動すると通知が届きます。\n\n" +
        "【Android】\n" +
        "「通知を許可する」ボタンをタップするだけで届きます。\n\n" +
        "【PC】\n" +
        "ホーム画面への追加は不要です。このアプリ内の通知ベルでお知らせを確認できます ☕"

      await fetch("/api/notifications/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, body: notifBody }),
      })
      // NotificationBell にリフレッシュを通知する
      window.dispatchEvent(new Event("notifications:refresh"))
    } catch (e) {
      console.error("ウェルカム通知の作成失敗:", e)
    }
  }

  const close = () => {
    localStorage.removeItem("pwa_onboarding_pending")
    setIsOpen(false)
    // モーダルを閉じるときにウェルカム通知を作成する（プラットフォーム別の内容で）
    createWelcomeNotification(platform)
  }

  // Android: 通知許可 + Push 購読
  const requestAndroidPermission = async () => {
    if (!("Notification" in window)) { close(); return }
    const permission = await Notification.requestPermission()
    if (permission !== "granted") { close(); return }

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
      setPermissionGranted(true)
      // 通知許可が取れたらAndroid用ウェルカム通知を作成する
      await createWelcomeNotification("android")
    } catch (e) {
      console.error("Push購読エラー:", e)
      close()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      {/* モーダル本体 */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-5">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <p className="text-base font-bold text-stone-800">もくカフェへようこそ！</p>
          </div>
          <button onClick={close} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
        </div>

        {/* 説明 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-sm font-bold text-amber-900">🔔 通知を受け取るには設定が必要です</p>
          <p className="text-xs text-stone-700 leading-relaxed">
            参加申請・承認・却下などをスマホにお知らせします。{"\n"}
            {platform === "ios"
              ? "iOSでは「ホーム画面に追加」してから起動することで通知が届くようになります。"
              : "通知を許可するだけで届くようになります。"}
          </p>
        </div>

        {/* iOS: ホーム画面追加手順 */}
        {platform === "ios" && (
          <ol className="flex flex-col gap-3">
            {IOS_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-stone-700 leading-relaxed">
                  <span className="mr-1">{step.icon}</span>{step.text}
                </p>
              </li>
            ))}
          </ol>
        )}

        {/* Android: 通知許可ボタン or 完了メッセージ */}
        {platform === "android" && (
          permissionGranted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-800">✅ 通知が設定されました！</p>
            </div>
          ) : (
            <button
              onClick={requestAndroidPermission}
              className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold transition-colors"
            >
              🔔 通知を許可する
            </button>
          )
        )}

        {/* 閉じるボタン */}
        <button
          onClick={close}
          className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          {platform === "ios" ? "あとで設定する" : "閉じる"}
        </button>
      </div>
    </div>
  )
}

export default PwaOnboardingModal
