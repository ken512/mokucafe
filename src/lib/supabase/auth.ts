import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Postman等のBearerトークンでも認証できるようにするヘルパー
// Cookie認証（ブラウザ）とBearer認証（Postman/APIクライアント）の両方に対応する

type AuthResult =
  | { success: true; userId: number }
  | { success: false; message: string }

// リクエストヘッダーからBearerトークンを取得する
export const extractBearerToken = (request: NextRequest): string | null => {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.replace("Bearer ", "")
}

// SupabaseユーザーIDからアプリDBのユーザーIDを取得する
const resolveUserId = async (supabaseUserId: string): Promise<number | null> => {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true },
  })
  return user?.id ?? null
}

// Bearerトークンを検証してアプリDBのuserIdを返す
export const authenticateRequest = async (request: NextRequest): Promise<AuthResult> => {
  const token = extractBearerToken(request)
  if (!token) {
    return { success: false, message: "認証が必要です（Authorization: Bearer <token>）" }
  }

  // supabase-js（cookie不要）でトークン検証する
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { success: false, message: "トークンが無効です" }
  }

  // 匿名ユーザーは書き込み系APIの使用を禁止する
  if (data.user.is_anonymous) {
    return { success: false, message: "ゲストユーザーはこの操作を行えません。登録を行なってください。" }
  }

  const userId = await resolveUserId(data.user.id)
  if (!userId) {
    return { success: false, message: "ユーザーが見つかりません" }
  }

  return { success: true, userId }
}

// Cookie ベースのセッション有無を確認する（Places API など読み取り系プロキシ用）
// ブラウザリクエストは自動的にクッキーを送るので Bearer トークン不要
export const requireSession = async (): Promise<boolean> => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
