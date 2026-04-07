import Link from "next/link"

const Header = () => {
  return (
    <header className="bg-white w-full">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-stone-800">カフェで作業仲間を見つけよう</p>
        <p className="text-base font-bold text-stone-800">☕ もくカフェ</p>
      </div>

      <div className="flex items-center gap-2">
<Link
          href="/register"
          className="text-sm border border-amber-900 text-amber-900 hover:bg-amber-50 font-medium px-4 py-1.5 rounded-full transition-colors"
        >
          新規登録
        </Link>
        <Link
          href="/login"
          className="text-sm bg-amber-900 hover:bg-amber-800 text-white font-medium px-4 py-1.5 rounded-full transition-colors"
        >
          ログイン
        </Link>
      </div>
      </div>
    </header>
  )
}

export default Header
