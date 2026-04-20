import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// DELETE /api/notifications — 自分の通知を削除する
// body: { ids: number[] } → 指定IDのみ削除
// body: {} or ids 省略   → すべて削除（一括削除）
export const DELETE = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const ids: number[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined

  await prisma.notification.deleteMany({
    where: {
      userId: auth.userId,
      ...(ids ? { id: { in: ids } } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

// GET /api/notifications — 自分の通知一覧を取得する（最新20件）
export const GET = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      postId: true,
      isRead: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ notifications })
}
