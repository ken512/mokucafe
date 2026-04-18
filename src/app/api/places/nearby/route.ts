import { NextRequest, NextResponse } from "next/server"
import { PlaceSuggestion } from "../autocomplete/route"
import { requireSession } from "@/lib/supabase/auth"

export const dynamic = "force-dynamic"

type NearbyPlace = {
  id: string
  displayName: { text: string }
  formattedAddress: string
}

type NearbyResponse = {
  places?: NearbyPlace[]
  error?: { message: string; status: string }
}

// POST /api/places/nearby — 現在地周辺のカフェを取得する（カフェ特化 Nearby Search）
export const POST = async (request: NextRequest) => {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Places API が設定されていません" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const lat = typeof body?.lat === "number" ? body.lat : null
  const lng = typeof body?.lng === "number" ? body.lng : null
  if (lat === null || lng === null) {
    return NextResponse.json({ error: "lat/lng が必要です" }, { status: 400 })
  }

  // 検索半径（デフォルト 100m、最大 1000m）
  const radius = Math.min(typeof body?.radius === "number" ? body.radius : 100, 1000)

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
        },
        body: JSON.stringify({
          includedTypes: ["cafe", "coffee_shop"],
          maxResultCount: 20,
          languageCode: "ja",
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius,
            },
          },
        }),
      }
    )

    const data: NearbyResponse = await res.json()

    if (data.error) {
      console.error("[places/nearby] error:", data.error.status, data.error.message)
      return NextResponse.json({ error: `Places API エラー: ${data.error.status}` }, { status: 500 })
    }

    const suggestions: PlaceSuggestion[] = (data.places ?? []).map((p) => ({
      placeId: p.id,
      name: p.displayName.text,
      address: p.formattedAddress,
    }))

    return NextResponse.json({ suggestions })
  } catch (e) {
    console.error("[places/nearby] fetch error:", e)
    return NextResponse.json({ error: "近くのカフェ取得に失敗しました" }, { status: 500 })
  }
}
