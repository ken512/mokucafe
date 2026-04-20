import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { authenticateRequest } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// POST /api/ai/generate-share
// 投稿内容をもとに X・Threads・Instagram 用のシェア文をプラットフォーム別に生成する
export const POST = async (request: NextRequest) => {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.message }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { cafeName, cafeAddress, date, endDate, description, tags } = body ?? {}

  if (!cafeName || !date) {
    return NextResponse.json({ error: "cafeName・date は必須です" }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API が設定されていません" }, { status: 500 })
  }

  // 日時を読みやすい形式に変換する
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const dateStr = formatDate(date)
  const endDateStr = endDate ? formatDate(endDate) : null
  const timeRange = endDateStr ? `${dateStr}〜${endDateStr}` : dateStr
  const tagsStr = tags?.length > 0 ? tags.join("・") : "なし"

  const prompt = `
あなたはSNSマーケティングの専門家です。
以下のカフェ作業仲間募集の情報をもとに、各SNSプラットフォーム向けのシェア文を生成してください。

【募集情報】
- カフェ名: ${cafeName}
- 住所: ${cafeAddress ?? "未設定"}
- 作業日時: ${timeRange}
- 内容: ${description ?? "なし"}
- タグ: ${tagsStr}

【生成ルール】
- アプリ名「もくカフェ」を必ず含める
- 絵文字を自然に使う
- 実際の投稿URLは [URL] というプレースホルダーにする

【X（Twitter）用】
- 140字以内（日本語）
- ハッシュタグを2〜3個末尾に追加（例：#もくもく作業 #カフェ作業 #もくカフェ）
- 簡潔でテンポよく

【Threads用】
- 200字程度
- ハッシュタグなし
- 親しみやすくカジュアルなトーン

【Instagram用】
- 150字程度の本文
- 末尾にハッシュタグを5〜8個（例：#カフェ作業 #もくもく作業 #カフェ #作業場所 #もくカフェ）
- 視覚的で雰囲気が伝わる表現

以下のJSON形式のみで返答してください（コードブロック不要）:
{"x":"","threads":"","instagram":""}
`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // JSONのみ抽出する（```json ... ``` が含まれる場合に対応）
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[generate-share] JSON抽出失敗:", text)
      return NextResponse.json({ error: "生成結果の解析に失敗しました" }, { status: 500 })
    }

    const generated: { x: string; threads: string; instagram: string } = JSON.parse(jsonMatch[0])
    return NextResponse.json(generated)
  } catch (e: unknown) {
    console.error("[generate-share] Gemini エラー:", e)
    return NextResponse.json({ error: "シェア文の生成に失敗しました" }, { status: 500 })
  }
}
