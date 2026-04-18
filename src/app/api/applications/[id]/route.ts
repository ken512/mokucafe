import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// PATCH /api/applications/[id]
// - オーナー: PENDING → APPROVED / REJECTED
// - 申請者本人: APPROVED → ATTENDING（参加確定）
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

  if (!["APPROVED", "REJECTED", "ATTENDING"].includes(status)) {
    return NextResponse.json(
      { error: "status は APPROVED / REJECTED / ATTENDING で指定してください" },
      { status: 400 }
    )
  }

  // 申請の存在確認
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      userId: true,
      post: { select: { userId: true } },
    },
  })

  if (!application) {
    return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 })
  }

  // ATTENDING への変更は申請者本人のみ（APPROVED が前提）
  if (status === "ATTENDING") {
    if (application.userId !== auth.userId) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }
    if (application.status !== "APPROVED") {
      return NextResponse.json({ error: "承認済みの申請のみ参加確定できます" }, { status: 400 })
    }
  } else {
    // APPROVED / REJECTED への変更はオーナーのみ（PENDING が前提）
    if (application.post.userId !== auth.userId) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }
    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "すでに処理済みの申請です" }, { status: 400 })
    }
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    select: { id: true, status: true },
  })

  return NextResponse.json({ application: updated })
}
