import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/adminToken"

export const dynamic = "force-dynamic"

type BroadcastBody = {
  title: string
  body: string
  userIds?: number[]
}

// POST /api/admin/broadcast — 管理者が全ユーザー（または指定ユーザー）に通知を一斉送信する
// admin_token Cookie で認証する（Bearer トークンではなく Cookie に統一）
export const POST = async (request: NextRequest) => {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET が設定されていません" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  if (!token || !await verifyAdminToken(token, adminSecret)) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as BroadcastBody | null
  if (!body?.title || !body?.body) {
    return NextResponse.json({ error: "title と body は必須です" }, { status: 400 })
  }

  const { title, body: messageBody, userIds } = body

  const users = await prisma.user.findMany({
    where: userIds ? { id: { in: userIds } } : undefined,
    select: { id: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ error: "送信対象ユーザーが存在しません" }, { status: 404 })
  }

  await prisma.notification.createMany({
    data: users.map((user: { id: number }) => ({
      userId: user.id,
      type: "SYSTEM" as const,
      title,
      body: messageBody,
    })),
  })

  return NextResponse.json({ ok: true, sent: users.length })
}
