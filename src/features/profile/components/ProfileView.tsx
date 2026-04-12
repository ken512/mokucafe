import Image from "next/image"
import { Profile } from "../types"

type Props = {
  profile: Profile
  onEditClick: () => void
}

// SNSリンクのアイコン定義
const SNS_ICONS = [
  {
    key: "xUrl" as const,
    label: "X",
    icon: (
      // X（旧Twitter）ロゴ
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "instagramUrl" as const,
    label: "Instagram",
    icon: (
      // Instagram ロゴ
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "threadsUrl" as const,
    label: "Threads",
    icon: (
      // Threads ロゴ
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.848 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.005.213.011.316.018 1.137.075 2.2.42 3.07 1 1.36.9 2.162 2.267 2.28 3.854.25 3.32-2.078 6.43-6.48 6.43-.4 0-.83-.03-1.276-.1zM9.5 15.882c.353 0 .683-.03.985-.09.906-.175 1.607-.69 2.079-1.525.428-.77.617-1.797.563-3.064-1.013-.14-1.979-.12-2.845.06-.814.173-1.439.5-1.854.966-.4.447-.583.997-.543 1.596.06 1 .764 2.057 1.615 2.057z" />
      </svg>
    ),
  },
  {
    key: "githubUrl" as const,
    label: "GitHub",
    icon: (
      // GitHub ロゴ
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
]

// プロフィール詳細表示コンポーネント
const ProfileView = ({ profile, onEditClick }: Props) => {
  const activeSns = SNS_ICONS.filter(({ key }) => !!profile[key])

  return (
    <div className="flex flex-col">
      {/* 上部：背景＋アバター */}
      <div className="relative">
        <div className="h-28 bg-stone-200 rounded-t-2xl" />
        {/* アバター（背景とコンテンツの境界に配置） */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-amber-100 shadow-sm">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-900 text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下部：コンテンツ */}
      <div className="bg-white rounded-b-2xl pt-16 pb-6 px-6 flex flex-col items-center gap-4 shadow-sm">
        {/* 名前＋編集ボタン */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-stone-800">{profile.name}</h1>
          <button
            onClick={onEditClick}
            className="text-xs font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full transition-colors"
          >
            編集
          </button>
        </div>

        {/* SNS アイコン（登録済みのものだけ表示） */}
        {activeSns.length > 0 && (
          <div className="flex items-center gap-5">
            {activeSns.map(({ key, label, icon }) => (
              <a
                key={key}
                href={profile[key]!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        )}

        {/* 自己紹介 */}
        {profile.bio && (
          <p className="text-sm text-stone-700 leading-relaxed text-center whitespace-pre-wrap w-full">
            {profile.bio}
          </p>
        )}

        {/* 自己紹介・SNSが未設定の場合のガイダンス */}
        {!profile.bio && activeSns.length === 0 && (
          <p className="text-sm text-stone-400">
            編集ボタンから自己紹介やSNSを追加しましょう
          </p>
        )}
      </div>
    </div>
  )
}

export default ProfileView
