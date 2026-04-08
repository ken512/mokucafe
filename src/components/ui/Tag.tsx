type Props = {
  label: string
}

// 投稿タグ表示コンポーネント
const Tag = ({ label }: Props) => {
  return (
    <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-full px-2.5 py-0.5">
      {label}
    </span>
  )
}

export default Tag
