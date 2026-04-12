import Image from "next/image"

type Props = {
  address: string
  cafeName: string
}

// カフェの位置を Maps Static API で表示する（サーバープロキシ経由でAPIキーを隠蔽）
// Embed API（iframe + JS）と異なり PNG 画像を返すだけなので RefererNotAllowedMapError が起きない
const CafeMap = ({ address, cafeName }: Props) => {
  const src = `/api/places/embed?address=${encodeURIComponent(address)}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" title={`${cafeName}をGoogle マップで開く`}>
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
