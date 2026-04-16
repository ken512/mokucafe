import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// GET /api/places/details?placeId=xxx
// Place Details API（New）で建物名・郵便番号を含む完全な住所を取得する
export const GET = async (request: NextRequest) => {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const placeId = request.nextUrl.searchParams.get("placeId")
  if (!placeId) {
    return NextResponse.json({ error: "placeId パラメータが必要です" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Places API が設定されていません" }, { status: 500 })
  }

  try {
    const res = await fetch(
      // languageCode=ja で日本語住所を取得する
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=ja`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          // formattedAddress に建物名・郵便番号が含まれる
          "X-Goog-FieldMask": "formattedAddress",
        },
      }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error("[places/details] error:", res.status, body.slice(0, 300))
      return NextResponse.json({ error: "住所の取得に失敗しました" }, { status: res.status })
    }

    const data: { formattedAddress?: string } = await res.json()
    // 先頭の "Japan, " / "日本、" などの国名プレフィックスを除去する
    const formattedAddress = data.formattedAddress
      ?.replace(/^(Japan,\s*|日本、\s*)/i, "") ?? null
    return NextResponse.json({ formattedAddress })
  } catch (e) {
    console.error("[places/details] fetch error:", e)
    return NextResponse.json({ error: "通信エラーが発生しました" }, { status: 500 })
  }
}
