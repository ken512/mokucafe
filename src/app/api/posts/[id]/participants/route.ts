import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// GET /api/posts/[id]/participants — 承認済み参加者一覧を取得する（ログイン必須）
export const GET = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ participants: [] })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ participants: [] })
  }

  const applications = await prisma.application.findMany({
    where: { postId, status: { in: ["APPROVED", "ATTENDING"] } },
    orderBy: { updatedAt: "asc" },
    select: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  })

  const participants = applications.map((a: { user: { id: number; name: string; avatarUrl: string | null } }) => a.user)

  return NextResponse.json({ participants })
}
