import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// PATCH /api/applications/[id] — 申請を承認 or 却下する（オーナーのみ）
export const PATCH = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const applicationId = parseInt(id)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: "不正なIDです" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const status = body?.status
  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "status は APPROVED または REJECTED で指定してください" }, { status: 400 })
  }

  // 申請の存在確認とオーナー確認
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      post: { select: { userId: true } },
    },
  })

  if (!application) {
    return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 })
  }

  if (application.post.userId !== auth.userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }

  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "すでに処理済みの申請です" }, { status: 400 })
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    select: { id: true, status: true },
  })

  return NextResponse.json({ application: updated })
}
