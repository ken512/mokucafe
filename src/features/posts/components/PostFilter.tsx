"use client"

// よく使われるタグの候補一覧
const PRESET_TAGS = [
  "もくもく作業",
  "会話OK",
  "静かに集中",
  "エンジニア",
  "デザイナー",
  "勉強",
  "副業",
  "朝活",
]

type Props = {
  q: string
  tag: string
  onQChange: (value: string) => void
  onTagChange: (value: string) => void
}

// 募集一覧のフィルターコンポーネント（テキスト検索 + タグフィルター）
const PostFilter = ({ q, tag, onQChange, onTagChange }: Props) => {
  const handleTagClick = (t: string) => {
    // 同じタグをクリックしたら解除する
    onTagChange(tag === t ? "" : t)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* テキスト検索 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="カフェ名・エリア・作業内容で検索"
          className="w-full border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={() => onQChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors text-xs"
            aria-label="検索をクリア"
          >
            ✕
          </button>
        )}
      </div>

      {/* タグフィルター */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTagClick(t)}
            className={[
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              tag === t
                ? "bg-amber-900 text-white border-amber-900"
                : "bg-white text-amber-900 border-amber-200 hover:bg-amber-50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* アクティブフィルターの表示 */}
      {(q || tag) && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>絞り込み中：</span>
          {q && <span className="bg-stone-100 rounded-full px-2.5 py-1">「{q}」</span>}
          {tag && <span className="bg-amber-50 text-amber-900 border border-amber-200 rounded-full px-2.5 py-1">#{tag}</span>}
          <button
            type="button"
            onClick={() => { onQChange(""); onTagChange("") }}
            className="ml-auto text-stone-400 hover:text-stone-600 transition-colors underline"
          >
            クリア
          </button>
        </div>
      )}
    </div>
  )
}

export default PostFilter
