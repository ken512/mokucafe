import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"
import { notify } from "@/lib/notify"

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
      user: { select: { name: true } },
      post: { select: { id: true, userId: true, cafeName: true } },
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

  // ステータスに応じた通知を送る（非同期・失敗しても無視）
  const cafeName = application.post.cafeName
  const postId = application.post.id
  const applicantName = application.user.name

  if (status === "APPROVED") {
    notify({
      recipientUserId: application.userId,
      type: "APPLICATION_APPROVED",
      title: "参加申請が承認されました",
      body: `「${cafeName}」への参加申請が承認されました。参加確定を忘れずに！`,
      postId,
    }).catch(console.error)
  } else if (status === "REJECTED") {
    notify({
      recipientUserId: application.userId,
      type: "APPLICATION_REJECTED",
      title: "参加申請が却下されました",
      body: `「${cafeName}」への参加申請が却下されました`,
      postId,
    }).catch(console.error)
  } else if (status === "ATTENDING") {
    notify({
      recipientUserId: application.post.userId,
      type: "ATTENDANCE_CONFIRMED",
      title: "参加が確定しました",
      body: `${applicantName}さんが「${cafeName}」への参加を確定しました`,
      postId,
    }).catch(console.error)
  }

  return NextResponse.json({ application: updated })
}
