import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Places Autocomplete API のレスポンス型
type PlacePrediction = {
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

type GoogleAutocompleteResponse = {
  status: string
  predictions: PlacePrediction[]
}

// カフェ名候補の型（フロントエンドに返す）
export type PlaceSuggestion = {
  placeId: string
  name: string
  address: string
}

// POST /api/places/autocomplete — カフェ名の入力補助（サーバー経由でAPIキーを秘匿する）
export const POST = async (request: NextRequest) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Places API が設定されていません" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const input = typeof body?.input === "string" ? body.input.trim() : ""
  if (!input) {
    return NextResponse.json({ suggestions: [] })
  }

  // 現在地（任意）をクエリパラメータとして受け取る
  const lat = typeof body?.lat === "number" ? body.lat : null
  const lng = typeof body?.lng === "number" ? body.lng : null

  const params = new URLSearchParams({
    input,
    key: apiKey,
    language: "ja",
    types: "establishment",
    components: "country:jp",
  })

  // 現在地が渡された場合は半径5km以内を優先する
  if (lat !== null && lng !== null) {
    params.set("location", `${lat},${lng}`)
    params.set("radius", "5000")
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    )
    const data: GoogleAutocompleteResponse = await res.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({ error: "候補の取得に失敗しました" }, { status: 500 })
    }

    const suggestions: PlaceSuggestion[] = data.predictions.map((p) => ({
      placeId: p.place_id,
      name: p.structured_formatting.main_text,
      address: p.structured_formatting.secondary_text,
    }))

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ error: "候補の取得に失敗しました" }, { status: 500 })
  }
}
