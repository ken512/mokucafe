import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// POST /api/cron/cleanup
// 作業終了から1時間以上経過した投稿を自動削除する（Vercel Cron Job で毎時実行）
export const GET = async (request: NextRequest) => {
  // CRON_SECRET 未設定の場合はサーバー設定エラーとして早期リターン
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET が未設定です" }, { status: 500 })
  }

  // Vercel Cron からのリクエストのみ受け付ける
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 作業終了から1時間以上経過した投稿を取得・削除する
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  try {
    const { count } = await prisma.post.deleteMany({
      where: {
        endDate: {
          // endDate が1時間以上前 = 作業終了から1時間経過
          lt: oneHourAgo,
        },
      },
    })

    console.log(`[cron/cleanup] ${count} 件の期限切れ投稿を削除しました`)
    return NextResponse.json({ deleted: count })
  } catch (e) {
    console.error("[cron/cleanup] 削除エラー:", e)
    return NextResponse.json({ error: "削除処理に失敗しました" }, { status: 500 })
  }
}
