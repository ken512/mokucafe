import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/getUser"
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

  // JWT をローカルで読むだけ（ネットワーク不要）→ SNSクエリの投機的並列実行に使う
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const speculativeUserId = session?.user?.id

  // 投稿取得・認証検証・SNS取得を全て並列実行する
  // SNSクエリはオーナーでなかった場合は結果を捨てる（投機的実行）
  const [postRaw, authResult, snsResult] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { name: true, avatarUrl: true, supabaseUserId: true } },
        _count: { select: { applications: true } },
      },
    }),
    // React cache() により layout.tsx の getUser() と重複しない
    getUser(),
    speculativeUserId
      ? prisma.user.findUnique({
          where: { supabaseUserId: speculativeUserId },
          select: { xUrl: true, threadsUrl: true, instagramUrl: true },
        })
      : Promise.resolve(null),
  ])

  if (!postRaw) notFound()

  const user = authResult.data.user
  const isLoggedIn = !!user && user.is_anonymous !== true
  const isOwner = isLoggedIn && user?.id === postRaw.user.supabaseUserId
  // 投機的に取得したSNSはオーナーの場合のみ使う
  const userSns = isOwner ? snsResult : null

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
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors self-start"
        >
          ☕ ← もどる
        </Link>

        <PostDetailPageClient
          initialPost={post}
          isLoggedIn={isLoggedIn}
          isOwner={isOwner}
          userSns={userSns ?? undefined}
        />
      </main>
    </div>
  )
}

export default PostDetailPage
