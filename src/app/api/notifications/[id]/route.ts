import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// DELETE /api/notifications/[id] — 自分の通知を1件削除する
export const DELETE = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const notificationId = parseInt(id)
  if (isNaN(notificationId)) {
    return NextResponse.json({ error: "不正なIDです" }, { status: 400 })
  }

  // 自分の通知のみ削除可（他人の通知を削除できないよう userId で絞る）
  const deleted = await prisma.notification.deleteMany({
    where: { id: notificationId, userId: auth.userId },
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: "通知が見つかりません" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
