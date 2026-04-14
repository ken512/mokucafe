// 現在時刻と開始・終了日時からリアルタイムステータスを計算する
export type WorkStatus = "upcoming" | "ongoing" | "finished"

export type WorkStatusDisplay = {
  label: string
  badgeClass: string
}

const STATUS_DISPLAY: Record<WorkStatus, WorkStatusDisplay> = {
  upcoming: {
    label: "実施前",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  ongoing: {
    label: "作業中",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
  },
  finished: {
    label: "作業終了",
    badgeClass: "bg-stone-100 text-stone-500 border border-stone-200",
  },
}

// 開始・終了日時と現在時刻からステータスを計算する
// endDate が null の場合は undefined を返す（バッジ非表示）
export const calcWorkStatus = (
  startDate: string,
  endDate: string | null,
  now: Date = new Date()
): WorkStatus | undefined => {
  if (!endDate) return undefined

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return "upcoming"
  if (now >= start && now < end) return "ongoing"
  return "finished"
}

export const getStatusDisplay = (status: WorkStatus): WorkStatusDisplay =>
  STATUS_DISPLAY[status]
