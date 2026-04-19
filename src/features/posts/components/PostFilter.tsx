"use client"

import { ApplicationStatus } from "@/features/applications/types"

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

// 申請ステータスフィルターの選択肢
const APPLICATION_STATUS_OPTIONS: { label: string; value: ApplicationStatus; icon: string }[] = [
  { label: "申請中",  value: "PENDING",  icon: "⏳" },
  { label: "承認済み", value: "APPROVED", icon: "✅" },
  { label: "却下",    value: "REJECTED", icon: "✕" },
]

type Props = {
  q: string
  tag: string
  applicationStatus: ApplicationStatus | ""
  hasApplications: boolean // 申請がある場合のみフィルターを表示
  onQChange: (value: string) => void
  onTagChange: (value: string) => void
  onApplicationStatusChange: (value: ApplicationStatus | "") => void
}

// 募集一覧のフィルターコンポーネント（テキスト検索 + タグフィルター + 申請ステータスフィルター）
const PostFilter = ({ q, tag, applicationStatus, hasApplications, onQChange, onTagChange, onApplicationStatusChange }: Props) => {
  const handleTagClick = (t: string) => {
    // 同じタグをクリックしたら解除する
    onTagChange(tag === t ? "" : t)
  }

  const handleStatusClick = (s: ApplicationStatus) => {
    // 同じステータスをクリックしたら解除する
    onApplicationStatusChange(applicationStatus === s ? "" : s)
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

      {/* 申請ステータスフィルター（申請が1件以上ある場合のみ表示） */}
      {hasApplications && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-stone-500 font-medium">申請した募集で絞り込む</p>
          <div className="flex gap-2">
            {APPLICATION_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusClick(opt.value)}
                className={[
                  "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors",
                  applicationStatus === opt.value
                    ? "bg-amber-900 text-white border-amber-900"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
                ].join(" ")}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* アクティブフィルターの表示 */}
      {(q || tag || applicationStatus) && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>絞り込み中：</span>
          {q && <span className="bg-stone-100 rounded-full px-2.5 py-1">「{q}」</span>}
          {tag && <span className="bg-amber-50 text-amber-900 border border-amber-200 rounded-full px-2.5 py-1">#{tag}</span>}
          {applicationStatus && (
            <span className="bg-amber-50 text-amber-900 border border-amber-200 rounded-full px-2.5 py-1">
              {APPLICATION_STATUS_OPTIONS.find((o) => o.value === applicationStatus)?.icon}{" "}
              {APPLICATION_STATUS_OPTIONS.find((o) => o.value === applicationStatus)?.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => { onQChange(""); onTagChange(""); onApplicationStatusChange("") }}
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
