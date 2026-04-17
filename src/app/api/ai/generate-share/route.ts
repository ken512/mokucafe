import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// 日時を「M/D HH:mm」形式に変換する
const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

// POST /api/ai/generate-share
// 投稿内容をもとに X・Threads・Instagram 用のシェア文をテンプレートで生成する
export const POST = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { cafeName, cafeAddress, date, endDate, tags } = body ?? {}

  if (!cafeName || !date) {
    return NextResponse.json({ error: "cafeName・date は必須です" }, { status: 400 })
  }

  const dateStr = formatDate(date as string)
  const endDateStr = endDate ? formatDate(endDate as string) : null
  const timeRange = endDateStr ? `${dateStr}〜${endDateStr}` : dateStr
  const tagLine = Array.isArray(tags) && tags.length > 0
    ? tags.map((t: string) => `#${t}`).join(" ")
    : ""
  const addressLine = cafeAddress ? `📍 ${cafeAddress}\n` : ""

  // X（140字以内）
  const x =
    `☕ ${cafeName}でもくもく作業しませんか？\n` +
    `🗓 ${timeRange}\n` +
    `${addressLine}` +
    `もくカフェで募集中！ [URL]\n` +
    `#もくもく作業 #カフェ作業 #もくカフェ`

  // Threads（200字程度・ハッシュタグなし）
  const threads =
    `${cafeName}でカフェ作業仲間を募集しています☕\n\n` +
    `🗓 ${timeRange}\n` +
    `${addressLine}` +
    `一緒にもくもく作業しましょう！\n` +
    `もくカフェアプリから参加申請できます👇\n[URL]`

  // Instagram（本文＋ハッシュタグ）
  const instagramTags = [
    "#もくもく作業", "#カフェ作業", "#カフェ", "#作業場所",
    "#もくカフェ", "#勉強カフェ", "#ひとり作業",
    ...(tagLine ? [tagLine] : []),
  ].join(" ")

  const instagram =
    `☕ ${cafeName}でもくもく作業仲間を募集中！\n\n` +
    `🗓 ${timeRange}\n` +
    `${addressLine}` +
    `もくカフェアプリから参加申請できます✨\n[URL]\n\n` +
    instagramTags

  return NextResponse.json({ x, threads, instagram })
}
