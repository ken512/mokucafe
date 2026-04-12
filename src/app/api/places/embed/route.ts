import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// GET /api/places/embed?address=xxx
// Maps Embed API をサーバー経由でプロキシする（APIキーをブラウザに露出しない）
export const GET = async (request: NextRequest) => {
  const address = request.nextUrl.searchParams.get("address")
  if (!address) {
    return new Response("address パラメータが必要です", { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return new Response("Maps API が設定されていません", { status: 500 })
  }

  const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&language=ja`

  try {
    // リクエスト元のオリジンを Referer に設定して APIキー制限と一致させる
    const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "http://localhost:3000"
    const res = await fetch(url, {
      headers: { Referer: origin },
    })
    const html = await res.text()

    return new Response(html, {
      status: res.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch {
    return new Response("地図の取得に失敗しました", { status: 500 })
  }
}
