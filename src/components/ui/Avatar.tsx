import Image from "next/image"

type Props = {
  name?: string | null
  avatarUrl?: string | null
  size?: "sm" | "md"
}

const sizeClass = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
}

const sizePx = { sm: 24, md: 32 }

// ユーザーアイコン（avatarUrl があれば画像、なければ名前の頭文字を表示）
const Avatar = ({ name, avatarUrl, size = "sm" }: Props) => {
  return (
    <div className={`${sizeClass[size]} rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? ""}
          width={sizePx[size]}
          height={sizePx[size]}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        name?.[0] ?? "?"
      )}
    </div>
  )
}

export default Avatar
