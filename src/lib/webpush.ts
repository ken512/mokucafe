import webpush from "web-push"
import { prisma } from "./prisma"

// VAPID 設定（初回インポート時に一度だけ実行）
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL ?? "noreply@example.com"}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

type PushPayload = {
  title: string
  body: string
  url?: string
}

// 指定ユーザーの全端末に Web Push を送る。期限切れの購読は自動削除する。
export const sendPush = async (userId: number, payload: PushPayload): Promise<void> => {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) return

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      )
    )
  )

  // 410 / 404 は購読失効 → DB から削除する
  const expiredEndpoints: string[] = []
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const status = (result.reason as { statusCode?: number })?.statusCode
      if (status === 410 || status === 404) {
        expiredEndpoints.push(subscriptions[i].endpoint)
      }
    }
  })

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    })
  }
}
