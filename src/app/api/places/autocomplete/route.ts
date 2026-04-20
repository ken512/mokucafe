import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

// Places API (New) のレスポンス型
type PlacePrediction = {
  placePrediction: {
    placeId: string
    structuredFormat: {
      mainText: { text: string }
      secondaryText: { text: string }
    }
  }
}

type GoogleAutocompleteResponse = {
  suggestions?: PlacePrediction[]
  error?: { message: string; status: string }
}

// カフェ名候補の型（フロントエンドに返す）
export type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
}

// POST /api/places/autocomplete — カフェ名の入力補助（サーバー経由でAPIキーを秘匿する）
export const POST = async (request: NextRequest) => {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Places API が設定されていません" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const input = typeof body?.input === "string" ? body.input.trim() : ""
  if (!input) {
    return NextResponse.json({ suggestions: [] })
  }

  const lat = typeof body?.lat === "number" ? body.lat : null
  const lng = typeof body?.lng === "number" ? body.lng : null

  // Places API (New) のリクエストボディ
  const requestBody: Record<string, unknown> = {
    input,
    languageCode: "ja",
    includedPrimaryTypes: ["establishment"],
    regionCode: "JP",
  }

  // 現在地が渡された場合は半径5km以内を優先する
  if (lat !== null && lng !== null) {
    requestBody.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000,
      },
    }
  }

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          // 必要なフィールドのみ取得してコストを抑える
          "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data: GoogleAutocompleteResponse = await res.json()

    if (data.error) {
      console.error("[Places API (New)] error:", data.error.status, data.error.message)
      return NextResponse.json(
        { error: `Google Places API エラー: ${data.error.status}` },
        { status: 500 }
      )
    }

    const suggestions: PlaceSuggestion[] = (data.suggestions ?? []).map((s) => ({
      placeId: s.placePrediction.placeId,
      name: s.placePrediction.structuredFormat.mainText.text,
      address: s.placePrediction.structuredFormat.secondaryText.text,
    }))

    return NextResponse.json({ suggestions })
  } catch (e: unknown) {
    console.error("[Places API (New)] fetch error:", e)
    return NextResponse.json({ error: "候補の取得に失敗しました" }, { status: 500 })
  }
}
