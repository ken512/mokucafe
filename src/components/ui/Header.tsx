import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import ButtonLink from "./ButtonLink"
import UserMenu from "./UserMenu"

// ヘッダー（認証状態に応じてUIを切り替えるサーバーコンポーネント）
const Header = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isGuest = user?.is_anonymous === true
  const isLoggedIn = !!user && !isGuest

  // ログイン済みユーザーのプロフィール（アバター表示に使用）
  let userProfile: { name: string; avatarUrl: string | null } | null = null
  if (isLoggedIn) {
    userProfile = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      select: { name: true, avatarUrl: true },
    })
  }

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-800">カフェで作業仲間を見つけよう</p>
          <p className="text-base font-bold text-stone-800">☕ もくカフェ</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 未ログイン */}
          {!user && (
            <>
              <ButtonLink href="/signup" variant="outline" size="sm">新規登録</ButtonLink>
              <ButtonLink href="/login" variant="primary" size="sm">ログイン</ButtonLink>
            </>
          )}

          {/* ゲストユーザー */}
          {isGuest && (
            <>
              <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                ゲスト中
              </span>
              <ButtonLink href="/signup" variant="primary" size="sm">登録する</ButtonLink>
            </>
          )}

          {/* ログイン済みユーザー：アバター＋ドロップダウン */}
          {isLoggedIn && userProfile && (
            <UserMenu
              name={userProfile.name}
              avatarUrl={userProfile.avatarUrl}
            />
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
