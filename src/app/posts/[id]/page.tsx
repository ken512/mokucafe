import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/ui/Header"
import PostDetailPageClient from "@/features/posts/components/PostDetailPageClient"
import { Post } from "@/features/posts/types"

type Props = {
  params: Promise<{ id: string }>
}

// 募集詳細ページ（認証不要・閲覧のみ。申請はログイン必要）
const PostDetailPage = async ({ params }: Props) => {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) notFound()

  const [postRaw, supabase] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { name: true, avatarUrl: true, supabaseUserId: true } },
        _count: { select: { applications: true } },
      },
    }),
    createClient(),
  ])

  if (!postRaw) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user && user.is_anonymous !== true
  // ログイン中ユーザーのSupabase UUIDと投稿者のIDが一致する場合に投稿者と判定する
  const isOwner = isLoggedIn && user?.id === postRaw.user.supabaseUserId

  const post: Post = {
    id: postRaw.id,
    cafeName: postRaw.cafeName,
    cafeAddress: postRaw.cafeAddress,
    cafePlaceId: postRaw.cafePlaceId,
    date: postRaw.date.toISOString(),
    endDate: postRaw.endDate?.toISOString() ?? null,
    capacity: postRaw.capacity,
    description: postRaw.description,
    tags: postRaw.tags,
    mediaUrls: postRaw.mediaUrls,
    status: postRaw.status,
    createdAt: postRaw.createdAt.toISOString(),
    host: { name: postRaw.user.name, avatarUrl: postRaw.user.avatarUrl },
    applicantCount: postRaw._count.applications,
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors self-start"
        >
          ☕ ← もどる
        </Link>

        <PostDetailPageClient initialPost={post} isLoggedIn={isLoggedIn} isOwner={isOwner} />
      </main>
    </div>
  )
}

export default PostDetailPage
