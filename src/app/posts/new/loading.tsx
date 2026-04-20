// 募集投稿フォームのスケルトンUI
const Loading = () => (
  <div className="min-h-screen bg-stone-100">
    <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="h-7 w-24 bg-stone-200 rounded-full animate-pulse" />
      <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-11 w-full bg-stone-200 rounded-xl" />
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-11 w-full bg-stone-200 rounded-xl" />
        <div className="flex gap-3">
          <div className="flex-1 h-11 bg-stone-200 rounded-xl" />
          <div className="flex-1 h-11 bg-stone-200 rounded-xl" />
        </div>
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-24 w-full bg-stone-200 rounded-xl" />
        <div className="h-12 w-full bg-stone-200 rounded-xl mt-2" />
      </div>
    </main>
  </div>
)

export default Loading
