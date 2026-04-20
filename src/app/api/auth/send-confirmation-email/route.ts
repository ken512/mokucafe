import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { render } from "@react-email/components"
import ConfirmEmail from "@/emails/ConfirmEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

// Supabase Auth Hook から呼ばれるメール確認送信API
// Hook payload: { user: { email, user_metadata }, email_data: { token, token_hash, redirect_to, email_action_type } }
export const POST = async (request: NextRequest) => {
  // Supabase Hook の署名検証
  const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET
  if (hookSecret) {
    const signature = request.headers.get("x-supabase-signature")
    if (!signature || signature !== hookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const email: string = body.user?.email
  const displayName: string | undefined = body.user?.user_metadata?.display_name
  const tokenHash: string = body.email_data?.token_hash
  const redirectTo: string = body.email_data?.redirect_to ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  if (!email || !tokenHash) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // 確認URL を組み立てる
  const confirmUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${tokenHash}&type=signup&redirect_to=${redirectTo}/auth/callback`

  const html = await render(ConfirmEmail({ confirmUrl, displayName }))

  const { error } = await resend.emails.send({
    from: `もくカフェ <${process.env.RESEND_FROM_EMAIL ?? "coffee@mockcafe.com"}>`,
    to: email,
    subject: "☕ もくカフェ — メールアドレスの確認",
    html,
  })

  if (error) {
    console.error("Resend 送信エラー:", error)
    return NextResponse.json({ error: "Mail send failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
