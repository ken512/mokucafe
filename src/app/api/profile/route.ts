import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// プロフィールフィールドの select を共通化する
const PROFILE_SELECT = {
  id: true,
  name: true,
  bio: true,
  avatarUrl: true,
  xUrl: true,
  instagramUrl: true,
  threadsUrl: true,
  githubUrl: true,
} as const

// GET /api/profile — 自分のプロフィールを取得する
export const GET = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: PROFILE_SELECT,
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    return NextResponse.json({ profile: user })
  } catch {
    return NextResponse.json({ error: "プロフィールの取得に失敗しました" }, { status: 500 })
  }
}

// PATCH /api/profile — プロフィールを更新する（指定フィールドのみ更新）
export const PATCH = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "リクエストボディが不正です" }, { status: 400 })
  }

  // 更新可能なフィールドのみ抽出する（未指定フィールドは更新しない）
  const updateData: Record<string, string | null> = {}
  const allowedFields = ["name", "bio", "avatarUrl", "xUrl", "instagramUrl", "threadsUrl", "githubUrl"]

  for (const field of allowedFields) {
    if (field in body) {
      const value = body[field]
      // 空文字は null に変換して保存する（name は除く）
      if (field === "name") {
        if (typeof value !== "string" || value.trim() === "") {
          return NextResponse.json({ error: "名前は必須です" }, { status: 400 })
        }
        updateData[field] = value.trim()
      } else {
        updateData[field] = typeof value === "string" && value.trim() !== "" ? value.trim() : null
      }
    }
  }

  // bio の文字数バリデーション
  if (typeof updateData.bio === "string" && updateData.bio.length > 500) {
    return NextResponse.json({ error: "自己紹介は500文字以内で入力してください" }, { status: 400 })
  }

  // SNS URL は https:// のみ許可（javascript: などの XSS 起点を防ぐ）
  const urlFields = ["xUrl", "instagramUrl", "threadsUrl", "githubUrl", "avatarUrl"] as const
  for (const field of urlFields) {
    const val = updateData[field]
    if (typeof val === "string") {
      try {
        const parsed = new URL(val)
        if (parsed.protocol !== "https:") throw new Error()
      } catch {
        return NextResponse.json(
          { error: `${field} は https:// で始まるURLを入力してください` },
          { status: 400 }
        )
      }
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: PROFILE_SELECT,
    })

    return NextResponse.json({ profile: user })
  } catch {
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 500 })
  }
}
