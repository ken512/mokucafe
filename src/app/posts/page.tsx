import Header from "@/components/ui/Header"
import ButtonLink from "@/components/ui/ButtonLink"
import PostsPageClient from "@/features/posts/components/PostsPageClient"

// 募集一覧ページ（/posts）
const PostsPage = () => {
  return (
    <div className="min-h-screen bg-stone-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-stone-800">募集一覧</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              一緒に作業する仲間を探そう
            </p>
          </div>
          <ButtonLink href="/posts/new" variant="primary" size="sm">
            ＋ 募集する
          </ButtonLink>
        </div>

        {/* 検索・フィルター ＋ 一覧 */}
        <PostsPageClient />
      </main>
    </div>
  )
}

export default PostsPage
