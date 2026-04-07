import Link from "next/link"
import SignupForm from "@/features/auth/components/SignupForm"

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
          >
            ☕ ← もどる
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-6">
          {/* タイトル */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-stone-800">新規登録</h1>
            <p className="text-sm text-stone-600">カフェで作業仲間を見つけよう</p>
          </div>

          <SignupForm />
        </div>
      </main>
    </div>
  )
}

export default SignupPage
