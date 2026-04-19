import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"
import { notify } from "@/lib/notify"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// POST /api/posts/[id]/applications — 参加申請する
export const POST = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: "不正なIDです" }, { status: 400 })
  }

  // 投稿の存在確認・ステータス確認
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      status: true,
      userId: true,
      cafeName: true,
      capacity: true,
      _count: { select: { applications: true } },
    },
  })

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
  }

  if (post.status !== "OPEN") {
    return NextResponse.json({ error: "この募集は受付終了しています" }, { status: 400 })
  }

  // オーナー自身は申請できない
  if (post.userId === auth.userId) {
    return NextResponse.json({ error: "自分の募集には申請できません" }, { status: 400 })
  }

  // 定員チェック
  if (post._count.applications >= post.capacity) {
    return NextResponse.json({ error: "定員に達しています" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 500) : null

  try {
    const application = await prisma.application.create({
      data: {
        postId,
        userId: auth.userId,
        message: message || null,
      },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
      },
    })
    // オーナーに「新規申請」通知を送る（失敗しても申請自体は成功）
    const applicant = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    })
    notify({
      recipientUserId: post.userId,
      type: "NEW_APPLICATION",
      title: "参加申請が届きました",
      body: `${applicant?.name ?? "ゲスト"}さんから「${post.cafeName}」への参加申請が届きました`,
      postId,
    }).catch(console.error)

    return NextResponse.json({ application }, { status: 201 })
  } catch (e: unknown) {
    // @@unique 違反 = 二重申請
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "すでに申請済みです" }, { status: 409 })
    }
    return NextResponse.json({ error: "申請に失敗しました" }, { status: 500 })
  }
}

// GET /api/posts/[id]/applications — オーナーが申請一覧を取得する
export const GET = async (request: NextRequest, { params }: Params) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: "不正なIDです" }, { status: 400 })
  }

  // オーナー確認
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
  }

  if (post.userId !== auth.userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }

  const applications = await prisma.application.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  })

  return NextResponse.json({ applications })
}
