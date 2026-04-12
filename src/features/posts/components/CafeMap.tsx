type Props = {
  address: string
  cafeName: string
}

// カフェの位置を Maps Embed API で表示する（APIキーはサーバープロキシで隠蔽）
const CafeMap = ({ address, cafeName }: Props) => {
  return (
    <iframe
      src={`/api/places/embed?address=${encodeURIComponent(address)}`}
      width="100%"
      height="300"
      className="w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`${cafeName}の地図`}
    />
  )
}

export default CafeMap
