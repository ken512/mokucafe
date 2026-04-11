import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"
import { validateCreatePost } from "@/features/posts/validations/postSchema"

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

// POST /api/posts — 募集投稿を作成する
export const POST = async (request: NextRequest) => {
  // 認証チェック（BearerトークンでPostmanからもテスト可能）
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  // リクエストボディのバリデーション
  const body = await request.json().catch(() => null)
  const validation = validateCreatePost(body)
  if (!validation.success) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 })
  }

  const { cafeName, cafeAddress, date, capacity, description, tags } = validation.data

  try {
    const post = await prisma.post.create({
      data: {
        userId: auth.userId,
        cafeName,
        cafeAddress,
        date: new Date(date),
        capacity,
        description,
        tags,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    )
  }
}
