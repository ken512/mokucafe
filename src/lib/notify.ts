import { NotificationType } from "@prisma/client"
import { prisma } from "./prisma"
import { sendPush } from "./webpush"

type NotifyInput = {
  recipientUserId: number   // 通知を受け取るユーザーの DB id
  type: NotificationType
  title: string
  body: string
  postId?: number
}

// アプリ内通知を作成し、Web Push を送信する
export const notify = async ({ recipientUserId, type, title, body, postId }: NotifyInput): Promise<void> => {
  // 1. アプリ内通知を DB に保存
  await prisma.notification.create({
    data: { userId: recipientUserId, type, title, body, postId },
  })

  // 2. Web Push 送信（失敗してもアプリ内通知は成功とする）
  try {
    await sendPush(recipientUserId, {
      title,
      body,
      url: postId ? `/posts/${postId}` : "/",
    })
  } catch (e: unknown) {
    console.error("[notify] Web Push 送信失敗:", e)
  }
}
