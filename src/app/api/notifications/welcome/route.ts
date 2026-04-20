import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// POST /api/notifications/welcome — ウェルカムシステム通知を作成する（初回1回のみ）
// body: { title: string, body: string } でプラットフォーム別の内容を受け取る
export const POST = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  // 既にウェルカム通知が存在する場合は重複作成しない（titleで判定し管理者通知と混同しない）
  const existing = await prisma.notification.findFirst({
    where: { userId: auth.userId, type: "SYSTEM", title: "📲 スマホ通知を受け取ろう" },
  })
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const body = await request.json().catch(() => ({}))
  const title = typeof body?.title === "string" ? body.title : "📲 スマホ通知を受け取ろう"
  const message = typeof body?.body === "string" ? body.body : ""

  await prisma.notification.create({
    data: {
      userId: auth.userId,
      type: "SYSTEM",
      title,
      body: message,
    },
  })

  return NextResponse.json({ ok: true })
}
