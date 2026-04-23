"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

// URL-safe Base64 → Uint8Array 変換（VAPID 公開鍵に使用）
const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

// ログイン済みユーザーの Service Worker を登録し、Web Push 購読を行うコンポーネント
// UI は持たない（返り値 null）
const PushSubscriptionManager = () => {
  useEffect(() => {
    const init = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

      // Service Worker を登録する
      const registration = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      // 通知許可を求める（未許可なら購読不可）
      const permission = await Notification.requestPermission()
      if (permission !== "granted") return

      // ブラウザの既存購読を取得、なければ新規作成する
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
        })
      }

      // 既存購読でも DB に未登録の可能性があるため毎回 upsert する
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(subscription),
      })
    }

    init().catch(console.error)
  }, [])

  return null
}

export default PushSubscriptionManager
