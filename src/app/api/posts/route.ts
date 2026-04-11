import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ビルド時の静的評価を防ぐ（PrismaはDB接続が必要なため実行時のみ評価する）
export const dynamic = "force-dynamic"

const LIMIT = 10

// GET /api/posts?cursor=<id>&limit=10
export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const cursor = searchParams.get("cursor")

  try {
    // limit + 1 件取得して「次のページがあるか」を判定する
    const posts = await prisma.post.findMany({
      where: { status: "OPEN" },
      take: LIMIT + 1,
      ...(cursor
        ? { cursor: { id: parseInt(cursor) }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
    })

    const hasMore = posts.length > LIMIT
    const items = hasMore ? posts.slice(0, LIMIT) : posts
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return NextResponse.json({
      posts: items.map((post) => ({
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
      })),
      nextCursor,
    })
  } catch {
    return NextResponse.json(
      { error: "募集一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}
