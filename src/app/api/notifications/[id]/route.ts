import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// DELETE /api/notifications/[id] — 通知を削除する
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

  // 通知の存在確認 + 所有者確認
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  })

  if (!notification) {
    return NextResponse.json({ error: "通知が見つかりません" }, { status: 404 })
  }

  // 本人の通知のみ削除可能
  if (notification.userId !== auth.userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }

  // 削除
  await prisma.notification.delete({
    where: { id: notificationId },
  })

  return NextResponse.json({ ok: true })
}
