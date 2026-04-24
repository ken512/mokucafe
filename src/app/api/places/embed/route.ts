import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// GET /api/places/embed?address=xxx&cafeName=xxx&placeId=xxx
// Maps Static API をサーバー経由でプロキシする（APIキーをブラウザに露出しない）
// 投稿詳細はゲスト・外部リンクでも閲覧可能なため認証不要
export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const address = searchParams.get("address")
  const cafeName = searchParams.get("cafeName") ?? ""
  const placeId = searchParams.get("placeId")

  if (!address) {
    return new Response("address パラメータが必要です", { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAP_API_KEY
  if (!apiKey) {
    return new Response("Maps API が設定されていません", { status: 500 })
  }

  // placeId があれば place_id: で正確にピン留め、なければカフェ名+住所でジオコーディング
  const markerLocation = placeId
    ? `place_id:${placeId}`
    : encodeURIComponent(`${cafeName} ${address}`)

  const center = placeId
    ? `place_id:${placeId}`
    : encodeURIComponent(`${cafeName} ${address}`)

  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=16&size=600x300&markers=color:red|${markerLocation}&language=ja&key=${apiKey}`

  try {
    const res = await fetch(url)

    if (!res.ok) {
      const body = await res.text()
      console.error("[places/embed] Google Static Maps error:", res.status, body.slice(0, 300))
      return new Response("地図の取得に失敗しました", { status: res.status })
    }

    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    })
  } catch (e: unknown) {
    console.error("[places/embed] fetch error:", e)
    console.error("[places/embed] fetch error:", e)
    return new Response("地図の取得に失敗しました", { status: 500 })
  }
}
