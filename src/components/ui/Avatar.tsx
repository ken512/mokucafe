type Props = {
  name?: string | null
  size?: "sm" | "md"
}

const sizeClass = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
}

// ユーザーアイコン（名前の頭文字を表示）
const Avatar = ({ name, size = "sm" }: Props) => {
  return (
    <div className={`${sizeClass[size]} rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0`}>
      {name?.[0] ?? "?"}
    </div>
  )
}

export default Avatar
