import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// GET /api/applications/me — 自分が申請した全投稿のステータス一覧を返す
export const GET = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ applications: [] })
  }

  const applications = await prisma.application.findMany({
    where: { userId: auth.userId },
    select: { postId: true, status: true },
  })

  return NextResponse.json({ applications })
}
