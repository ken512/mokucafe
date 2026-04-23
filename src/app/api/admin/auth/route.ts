import { NextRequest, NextResponse } from "next/server"
import { createAdminToken } from "@/lib/adminToken"

const COOKIE_NAME = "admin_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24時間

// POST /api/admin/auth — 管理者パスワードを検証してCookieをセットする
export const POST = async (request: NextRequest) => {
  const body = await request.json().catch(() => null)
  const secret = body?.secret as string | undefined

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET が設定されていません" }, { status: 500 })
  }

  if (!secret || secret !== adminSecret) {
    // ブルートフォース対策：失敗時に1秒の遅延を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 })
  }

  // ADMIN_SECRET そのものではなく HMAC 署名済みトークンを Cookie に保存する
  const token = createAdminToken(adminSecret)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
  return response
}

// DELETE /api/admin/auth — ログアウト（Cookieを削除する）
export const DELETE = async () => {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
