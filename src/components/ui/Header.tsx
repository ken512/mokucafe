import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import ButtonLink from "./ButtonLink"
import UserMenu from "./UserMenu"
import GuestMenu from "./GuestMenu"
import NotificationBell from "./NotificationBell"

// ヘッダー（認証状態に応じてUIを切り替えるサーバーコンポーネント）
const Header = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isGuest = user?.is_anonymous === true
  const isLoggedIn = !!user && !isGuest

  // 管理者Cookieを確認する
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("admin_token")?.value
  const isAdmin = !!adminToken && adminToken === process.env.ADMIN_SECRET

  // ログイン済みユーザーのプロフィール（アバター表示に使用）
  let userProfile: { name: string; avatarUrl: string | null } | null = null
  if (isLoggedIn) {
    userProfile = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      select: { name: true, avatarUrl: true },
    })

    // DBレコードがない場合は自動作成（メール確認コールバック失敗などの復旧）
    if (!userProfile) {
      const name =
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "ユーザー"
      try {
        await prisma.user.create({ data: { supabaseUserId: user.id, name } })
        userProfile = await prisma.user.findUnique({
          where: { supabaseUserId: user.id },
          select: { name: true, avatarUrl: true },
        })
      } catch {
        // 競合などは無視
      }
    }
  }

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ：クリックでホームへ遷移 */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <p className="text-xs text-stone-800">カフェで作業仲間を見つけよう</p>
          <p className="text-base font-bold text-stone-800">☕ もくカフェ</p>
        </Link>

        <div className="flex items-center gap-2">
          {/* 未ログイン、または auth セッションはあるが DB レコードがない（破損状態） */}
          {(!user || (isLoggedIn && !userProfile)) && (
            <>
              <ButtonLink href="/signup" variant="outline" size="sm">新規登録</ButtonLink>
              <ButtonLink href="/login" variant="primary" size="sm">ログイン</ButtonLink>
            </>
          )}

          {/* ゲストユーザー */}
          {isGuest && <GuestMenu />}

          {/* ログイン済みユーザー：通知ベル＋アバタードロップダウン */}
          {isLoggedIn && userProfile && (
            <>
              <NotificationBell />
              <UserMenu
                name={userProfile.name}
                avatarUrl={userProfile.avatarUrl}
                isAdmin={isAdmin}
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
