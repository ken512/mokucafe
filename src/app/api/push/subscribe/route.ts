import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// POST /api/push/subscribe — Web Push 購読情報を保存する
export const POST = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const endpoint = body?.endpoint
  const p256dh = body?.keys?.p256dh
  const authKey = body?.keys?.auth

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "購読情報が不正です" }, { status: 400 })
  }

  // 同じ endpoint は upsert（端末の再購読に対応）
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: auth.userId, endpoint, p256dh, auth: authKey },
    update: { userId: auth.userId, p256dh, auth: authKey },
  })

  return NextResponse.json({ ok: true })
}
