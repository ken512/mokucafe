import Image from "next/image"

type Props = {
  address: string
  cafeName: string
  placeId?: string | null // Google Places の placeId（あれば正確なピン留めに使用）
}

// カフェの位置を Maps Static API で表示する（サーバープロキシ経由でAPIキーを隠蔽）
const CafeMap = ({ address, cafeName, placeId }: Props) => {
  const params = new URLSearchParams({ address, cafeName })
  if (placeId) params.set("placeId", placeId)
  const src = `/api/places/embed?${params.toString()}`

  // placeId があれば店舗を直接指定、なければカフェ名+住所で検索
  const mapsQuery = placeId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafeName)}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafeName} ${address}`)}`

  return (
    <a href={mapsQuery} target="_blank" rel="noopener noreferrer" title={`${cafeName}をGoogle マップで開く`}>
      <Image
        src={src}
        alt={`${cafeName}の地図`}
        width={600}
        height={300}
        className="w-full rounded-lg"
        unoptimized
      />
    </a>
  )
}

export default CafeMap
