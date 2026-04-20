import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type BroadcastBody = {
  title: string
  body: string
  // 省略時は全ユーザーに送信、指定時は対象ユーザーのみ
  userIds?: number[]
}

// POST /api/admin/broadcast — 管理者が全ユーザー（または指定ユーザー）に通知を一斉送信する
// Authorization: Bearer <ADMIN_SECRET> で認証する
export const POST = async (request: NextRequest) => {
  // 管理者シークレットで認証する
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET が設定されていません" }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (token !== adminSecret) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as BroadcastBody | null
  if (!body?.title || !body?.body) {
    return NextResponse.json({ error: "title と body は必須です" }, { status: 400 })
  }

  const { title, body: messageBody, userIds } = body

  // 送信対象ユーザーを取得する
  const users = await prisma.user.findMany({
    where: userIds ? { id: { in: userIds } } : undefined,
    select: { id: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ error: "送信対象ユーザーが存在しません" }, { status: 404 })
  }

  // 全対象ユーザーに通知レコードを一括作成する
  await prisma.notification.createMany({
    data: users.map((user: { id: number }) => ({
      userId: user.id,
      type: "SYSTEM" as const,
      title,
      body: messageBody,
    })),
  })

  return NextResponse.json({
    ok: true,
    sent: users.length,
  })
}
