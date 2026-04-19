import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { prisma } from "@/lib/prisma"

// メール確認リンクのコールバック
// Supabase がメール内リンクに code パラメータを付与してリダイレクトしてくる
export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`)
  }

  // リダイレクト先のレスポンスを先に作成し、Cookieをここに直接セットする
  const response = NextResponse.redirect(`${origin}/`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // exchangeCodeForSession が設定するCookieをリダイレクトレスポンスに直接書き込む
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`)
  }

  // DBのusersテーブルにレコードがなければ作成する（初回確認時のみ）
  const supabaseUserId = data.session.user.id
  const displayName =
    (data.session.user.user_metadata?.display_name as string | undefined) ??
    data.session.user.email?.split("@")[0] ??
    "ユーザー"

  const existing = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true },
  })

  if (!existing) {
    await prisma.user.create({
      data: { supabaseUserId, name: displayName },
    })
  }

  // ウェルカム通知はプラットフォーム検出後にクライアント側（PwaOnboardingModal）で作成する

  return response
}
