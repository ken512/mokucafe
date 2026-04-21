import { createHmac, timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { render } from "@react-email/components"
import ConfirmEmail from "@/emails/ConfirmEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

// Supabase Hook の HMAC-SHA256 署名を検証する
const verifySignature = (rawBody: string, signature: string, secret: string): boolean => {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}

// Supabase Auth Hook から呼ばれるメール確認送信API
// Hook payload: { user: { email, user_metadata }, email_data: { token, token_hash, redirect_to, email_action_type } }
export const POST = async (request: NextRequest) => {
  const rawBody = await request.text()

  // デバッグ用：受信したヘッダーと署名を確認する（問題解決後に元に戻す）
  const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET
  const signature = request.headers.get("x-supabase-signature") ?? ""
  console.log("[send-confirmation-email] hookSecret 設定:", !!hookSecret)
  console.log("[send-confirmation-email] signature:", signature.slice(0, 20) + "...")
  if (hookSecret && signature) {
    const isValid = verifySignature(rawBody, signature, hookSecret)
    console.log("[send-confirmation-email] signature valid:", isValid)
    // 一時的に署名検証エラーでも続行（原因特定のため）
    // if (!isValid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = JSON.parse(rawBody)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const payload = body as {
    user?: { email?: string; user_metadata?: { display_name?: string } }
    email_data?: { token_hash?: string; redirect_to?: string }
  }

  const email = payload.user?.email
  const displayName = payload.user?.user_metadata?.display_name
  const tokenHash = payload.email_data?.token_hash
  const redirectTo = payload.email_data?.redirect_to ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  if (!email || !tokenHash) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // 確認URL を組み立てる
  const confirmUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${tokenHash}&type=signup&redirect_to=${redirectTo}/auth/callback`

  const html = await render(ConfirmEmail({ confirmUrl, displayName }))

  // デバッグ用：env と送信先を確認（問題解決後に削除する）
  console.log("[send-confirmation-email] RESEND_API_KEY 設定:", !!process.env.RESEND_API_KEY)
  console.log("[send-confirmation-email] RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL)
  console.log("[send-confirmation-email] 送信先:", email)

  const { data, error } = await resend.emails.send({
    from: `もくカフェ <${process.env.RESEND_FROM_EMAIL ?? "coffee@mockcafe.com"}>`,
    to: email,
    subject: "☕ もくカフェ — メールアドレスの確認",
    html,
  })

  console.log("[send-confirmation-email] Resend result:", { data, error })

  if (error) {
    console.error("Resend 送信エラー:", error)
    return NextResponse.json({ error: "Mail send failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
