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

const sizePx = {
  sm: 24,
  md: 32,
}

// ユーザーアイコン（avatarUrlがあれば画像、なければ頭文字を表示）
const Avatar = ({ name, avatarUrl, size = "sm" }: Props) => {
  return (
    <div className={`${sizeClass[size]} rounded-full overflow-hidden bg-amber-100 shrink-0`}>
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
        <div className="w-full h-full flex items-center justify-center text-amber-900 font-bold">
          {name?.[0] ?? "?"}
        </div>
      )}
    </div>
  )
}

export default Avatar
