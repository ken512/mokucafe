import { createHash } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notify"

type GuestRequest = { request: NextRequest; confirm: boolean }

// トークンはDBにハッシュで保存し、レスポンスをキャッシュしない
const handle = async ({ request, confirm }: GuestRequest) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" }
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "確認URLが無効です" }, { status: 404, headers })
  }
  const application = await prisma.application.findUnique({
    where: { guestTokenHash: createHash("sha256").update(token).digest("hex") },
    include: { post: true },
  })
  if (!application || application.userId !== null) {
    return NextResponse.json({ error: "応募が見つかりません" }, { status: 404, headers })
  }
  if (confirm) {
    if (application.post.status === "DONE" || (application.post.endDate && application.post.endDate <= new Date())) {
      return NextResponse.json({ error: "作業は終了しています" }, { status: 400, headers })
    }
    const result = await prisma.application.updateMany({
      where: { id: application.id, status: "APPROVED" },
      data: { status: "ATTENDING" },
    })
    if (!result.count) {
      return NextResponse.json({ error: "承認済みの応募のみ参加確定できます。状況を更新してください" }, { status: 409, headers })
    }
    application.status = "ATTENDING"
    notify({
      recipientUserId: application.post.userId,
      type: "ATTENDANCE_CONFIRMED",
      title: "参加が確定しました",
      body: `${application.guestName}さんが「${application.post.cafeName}」への参加を確定しました`,
      postId: application.postId,
    }).catch(console.error)
  }
  return NextResponse.json({ application: {
    name: application.guestName,
    status: application.status,
    post: { id: application.postId, cafeName: application.post.cafeName, date: application.post.date, endDate: application.post.endDate },
  } }, { headers })
}

export const GET = (request: NextRequest) => handle({ request, confirm: false })
export const PATCH = (request: NextRequest) => handle({ request, confirm: true })
