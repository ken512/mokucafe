import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// GET /api/posts/[id]/applications/me — 自分の申請ステータスを取得する
export const GET = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ application: null })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ application: null })
  }

  const application = await prisma.application.findUnique({
    where: { postId_userId: { postId, userId: auth.userId } },
    select: { id: true, status: true, message: true, createdAt: true },
  })

  return NextResponse.json({ application })
}
