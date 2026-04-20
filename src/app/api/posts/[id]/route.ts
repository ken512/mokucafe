import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import { authenticateRequest, extractBearerToken } from "@/lib/supabase/auth"
import { validateUpdatePost } from "@/features/posts/validations/postSchema"

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
        cafePlaceId: post.cafePlaceId,
        date: post.date.toISOString(),
        endDate: post.endDate?.toISOString() ?? null,
        capacity: post.capacity,
        description: post.description,
        tags: post.tags,
        mediaUrls: post.mediaUrls,
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

// PATCH /api/posts/:id — 募集投稿を編集する（本人のみ）
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const validation = validateUpdatePost(body)
  if (!validation.success) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    })

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
    }

    if (post.userId !== auth.userId) {
      return NextResponse.json({ error: "他のユーザーの投稿は編集できません" }, { status: 403 })
    }

    const { date, endDate, ...rest } = validation.data
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({
      post: {
        id: updated.id,
        cafeName: updated.cafeName,
        cafeAddress: updated.cafeAddress,
        cafePlaceId: updated.cafePlaceId,
        date: updated.date.toISOString(),
        endDate: updated.endDate?.toISOString() ?? null,
        capacity: updated.capacity,
        description: updated.description,
        tags: updated.tags,
        mediaUrls: updated.mediaUrls,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        host: { name: updated.user.name, avatarUrl: updated.user.avatarUrl },
        applicantCount: updated._count.applications,
      },
    })
  } catch {
    return NextResponse.json({ error: "投稿の更新に失敗しました" }, { status: 500 })
  }
}

// DELETE /api/posts/:id — 募集投稿を削除する（本人のみ）
// 投稿に紐づくStorageのメディアファイルも合わせて削除する
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    // 投稿の存在確認と本人チェックを行う
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, mediaUrls: true },
    })

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
    }

    if (post.userId !== auth.userId) {
      return NextResponse.json({ error: "他のユーザーの投稿は削除できません" }, { status: 403 })
    }

    // StorageのメディアファイルをユーザーのJWTで削除する（RLSポリシー適用）
    if (post.mediaUrls.length > 0) {
      const token = extractBearerToken(request)
      if (token) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        )
        // URLからバケット内のパスを抽出する
        // 例: https://xxx.supabase.co/storage/v1/object/public/post-media/userId/file.jpg
        //  → userId/file.jpg
        const paths = post.mediaUrls
          .map((url) => url.match(/\/object\/public\/post-media\/(.+)$/)?.[1])
          .filter((p): p is string => p !== undefined)

        if (paths.length > 0) {
          await supabase.storage.from("post-media").remove(paths)
        }
      }
    }

    // DB から投稿を削除する（Cascade で applications も削除される）
    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "投稿の削除に失敗しました" }, { status: 500 })
  }
}
