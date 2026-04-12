import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/posts/:id — 募集投稿の詳細を取得する
export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
    }

    return NextResponse.json({
      post: {
        id: post.id,
        cafeName: post.cafeName,
        cafeAddress: post.cafeAddress,
        date: post.date.toISOString(),
        capacity: post.capacity,
        description: post.description,
        tags: post.tags,
        status: post.status,
        createdAt: post.createdAt.toISOString(),
        host: { name: post.user.name, avatarUrl: post.user.avatarUrl },
        applicantCount: post._count.applications,
      },
    })
  } catch {
    return NextResponse.json({ error: "投稿の取得に失敗しました" }, { status: 500 })
  }
}
