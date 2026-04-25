import Link from "next/link"
import LoginForm from "@/features/auth/components/LoginForm"

type Props = { searchParams: Promise<{ confirmed?: string }> }

const LoginPage = async ({ searchParams }: Props) => {
  const { confirmed } = await searchParams
  const isConfirmed = confirmed === "1"

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

          {/* メール確認完了バナー */}
          {isConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-sm font-bold text-green-800">✅ メールアドレスの確認が完了しました！</p>
              <p className="text-xs text-green-700">ログインしてもくカフェを始めましょう ☕</p>
            </div>
          )}

          {/* タイトル */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-stone-800">ログイン</h1>
            <p className="text-sm text-stone-600">もくカフェへようこそ</p>
          </div>

          <LoginForm redirectTo={isConfirmed ? "/?new_user=1" : "/"} />
        </div>
      </main>
    </div>
  )
}

export default LoginPage
