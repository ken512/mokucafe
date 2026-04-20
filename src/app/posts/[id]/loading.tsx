// 募集詳細ページのスケルトンUI
const Loading = () => (
  <div className="min-h-screen bg-stone-100">
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* 戻るリンク */}
      <div className="h-7 w-24 bg-stone-200 rounded-full animate-pulse" />

      {/* カフェ情報カード */}
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-3 w-1/3 bg-stone-200 rounded" />
        <div className="h-6 w-2/3 bg-stone-200 rounded" />
        <div className="h-3 w-1/2 bg-stone-200 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 bg-stone-200 rounded-full" />
          <div className="h-5 w-16 bg-stone-200 rounded-full" />
        </div>
      </div>

      {/* 説明文カード */}
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-2 animate-pulse">
        <div className="h-4 w-full bg-stone-200 rounded" />
        <div className="h-4 w-5/6 bg-stone-200 rounded" />
        <div className="h-4 w-4/6 bg-stone-200 rounded" />
      </div>

      {/* 申請ボタン */}
      <div className="bg-white rounded-2xl p-5 animate-pulse">
        <div className="h-12 w-full bg-stone-200 rounded-xl" />
      </div>
    </main>
  </div>
)

export default Loading
