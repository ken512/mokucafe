import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// GET /api/notifications — ログイン済みユーザーの通知一覧を取得
export const GET = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      postId: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ notifications })
}

// PATCH /api/notifications/read — ユーザーのすべての通知を既読にする
export const PATCH = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: { userId: auth.userId },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/notifications — 通知を削除（複数削除 or 全削除）
export const DELETE = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const ids = Array.isArray(body?.ids) ? body.ids : null

  if (ids && Array.isArray(ids)) {
    // 複数削除：自分の通知だけ削除（権限確認）
    const notificationsToDelete = await prisma.notification.findMany({
      where: {
        id: { in: ids },
        userId: auth.userId, // 本人の通知のみ
      },
      select: { id: true },
    })

    if (notificationsToDelete.length === 0) {
      return NextResponse.json({ error: "削除対象がありません" }, { status: 400 })
    }

    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationsToDelete.map((n) => n.id) },
      },
    })

    return NextResponse.json({ ok: true, deleted: notificationsToDelete.length })
  } else {
    // 全削除：ユーザーのすべての通知を削除
    const result = await prisma.notification.deleteMany({
      where: { userId: auth.userId },
    })

    return NextResponse.json({ ok: true, deleted: result.count })
  }
}
