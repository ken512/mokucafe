import Link from "next/link"
import Header from "@/components/ui/Header"
import CreatePostForm from "@/features/posts/components/CreatePostForm"

// 募集投稿作成ページ（認証必須：middleware で /login にリダイレクト）
const PostNewPage = () => {
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

        {/* タイトル */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-stone-800">募集を投稿する</h1>
          <p className="text-sm text-stone-600">カフェで一緒に作業する仲間を募集しましょう</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <CreatePostForm />
        </div>
      </main>
    </div>
  )
}

export default PostNewPage
