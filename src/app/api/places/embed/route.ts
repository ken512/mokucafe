import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// GET /api/places/embed?address=xxx
// Maps Static API をサーバー経由でプロキシする（APIキーをブラウザに露出しない）
// Embed API と異なり PNG 画像を返すだけなのでクライアント側で JS が実行されない
export const GET = async (request: NextRequest) => {
  const address = request.nextUrl.searchParams.get("address")
  if (!address) {
    return new Response("address パラメータが必要です", { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAP_API_KEY
  if (!apiKey) {
    return new Response("Maps API が設定されていません", { status: 500 })
  }

  const encodedAddress = encodeURIComponent(address)
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x300&markers=color:red|${encodedAddress}&language=ja&key=${apiKey}`

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
  } catch (e) {
    console.error("[places/embed] fetch error:", e)
    return new Response(`地図の取得に失敗しました: ${String(e)}`, { status: 500 })
  }
}
