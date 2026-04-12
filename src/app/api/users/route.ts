import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// POST /api/users — サインアップ後にアプリDBへユーザーを登録する
export const POST = async (request: NextRequest) => {
  // Bearerトークンを検証してSupabaseのuserIdを取得する
  // （users テーブルには未登録なので resolveUserId はスキップする）
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "") ?? null

  if (!token) {
    return NextResponse.json(
      { error: "認証が必要です（Authorization: Bearer <token>）" },
      { status: 401 }
    )
  }

  // supabase-js でトークンを検証してSupabaseのユーザー情報を取得する
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return NextResponse.json({ error: "トークンが無効です" }, { status: 401 })
  }

  // 匿名ユーザーはアプリDBへの登録を禁止する（書き込み系APIの悪用を防ぐ）
  if (data.user.is_anonymous) {
    return NextResponse.json({ error: "ゲストユーザーは登録できません" }, { status: 403 })
  }

  const supabaseUserId = data.user.id

  // すでに登録済みの場合はそのまま返す（冪等性を保つ）
  const existing = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true, name: true },
  })
  if (existing) {
    return NextResponse.json({ user: existing }, { status: 200 })
  }

  // リクエストボディから表示名を取得する
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === "string" && body.name.trim() !== ""
    ? body.name.trim()
    : "名無しさん"

  try {
    const user = await prisma.user.create({
      data: { supabaseUserId, name },
      select: { id: true, name: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "ユーザーの登録に失敗しました" },
      { status: 500 }
    )
  }
}
