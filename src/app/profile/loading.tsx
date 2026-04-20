// プロフィールページのスケルトンUI
const Loading = () => (
  <div className="min-h-screen bg-stone-100">
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
      <div className="h-7 w-24 bg-stone-200 rounded-full animate-pulse" />
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
        {/* アバター */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-stone-200 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-32 bg-stone-200 rounded" />
            <div className="h-3 w-24 bg-stone-200 rounded" />
          </div>
        </div>
        {/* フォームフィールド */}
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-11 w-full bg-stone-200 rounded-xl" />
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-20 w-full bg-stone-200 rounded-xl" />
        <div className="h-12 w-full bg-stone-200 rounded-xl mt-2" />
      </div>
    </main>
  </div>
)

export default Loading
