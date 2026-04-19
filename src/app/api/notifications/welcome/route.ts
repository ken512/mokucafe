import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

const WELCOME_BODY =
  "通知を受け取るには、ホーム画面への追加が必要です（iOS）。\n\n" +
  "1️⃣ Safari下部の「共有」ボタン（□↑）をタップ\n" +
  "2️⃣ 「ホーム画面に追加」を選択\n" +
  "3️⃣ 「追加」をタップして完了\n" +
  "4️⃣ ホーム画面のアイコンから起動すると通知が届きます ☕"

// POST /api/notifications/welcome — ウェルカムシステム通知を作成する（初回1回のみ）
export const POST = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  // 既にウェルカム通知が存在する場合は重複作成しない
  const existing = await prisma.notification.findFirst({
    where: { userId: auth.userId, type: "SYSTEM" },
  })
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  await prisma.notification.create({
    data: {
      userId: auth.userId,
      type: "SYSTEM",
      title: "📲 スマホ通知を受け取ろう",
      body: WELCOME_BODY,
    },
  })

  return NextResponse.json({ ok: true })
}
