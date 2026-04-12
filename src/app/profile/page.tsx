import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/ui/Header"
import ProfilePageClient from "@/features/profile/components/ProfilePageClient"

// プロフィールページ（認証必須）
const ProfilePage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 未ログインはログインページへ
  if (!user || user.is_anonymous) {
    redirect("/login")
  }

  const profileRaw = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      xUrl: true,
      instagramUrl: true,
      threadsUrl: true,
      githubUrl: true,
    },
  })

  if (!profileRaw) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors self-start"
        >
          ☕ ← もどる
        </Link>

        <ProfilePageClient initialProfile={profileRaw} />
      </main>
    </div>
  )
}

export default ProfilePage
