// 現在時刻と開始・終了日時からリアルタイムステータスを計算する
export type WorkStatus =
  | "today"           // 当日（作業前）
  | "tomorrow"        // 明日
  | "this_week"       // 今週（2〜6日後）
  | "next_week"       // 来週（7〜13日後）
  | "this_month"      // 今月中（同じカレンダー月）
  | "next_month"      // 来月
  | "next_month_plus" // 再来月以降
  | "ongoing"         // 作業中
  | "finished"        // 終了

export type WorkStatusDisplay = {
  label: string
  badgeClass: string
}

const STATUS_DISPLAY: Record<WorkStatus, WorkStatusDisplay> = {
  today:           { label: "🔥 本日開催", badgeClass: "bg-red-50 text-red-700 border border-red-200" },
  tomorrow:        { label: "📅 明日開催", badgeClass: "bg-orange-50 text-orange-700 border border-orange-200" },
  this_week:       { label: "📅 今週開催", badgeClass: "bg-amber-50 text-amber-800 border border-amber-200" },
  next_week:       { label: "🗓 来週開催", badgeClass: "bg-blue-50 text-blue-700 border border-blue-200" },
  this_month:      { label: "🗓 今月開催", badgeClass: "bg-stone-100 text-stone-600 border border-stone-200" },
  next_month:      { label: "🗓 来月開催", badgeClass: "bg-stone-100 text-stone-500 border border-stone-200" },
  next_month_plus: { label: "🗓 再来月以降", badgeClass: "bg-stone-100 text-stone-400 border border-stone-200" },
  ongoing:         { label: "🟢 作業中",   badgeClass: "bg-green-50 text-green-700 border border-green-200" },
  finished:        { label: "✓ 終了",      badgeClass: "bg-stone-100 text-stone-400 border border-stone-200" },
}

// 開始・終了日時と現在時刻からステータスを計算する
export const calcWorkStatus = (
  startDate: string,
  endDate: string | null,
  now: Date = new Date()
): WorkStatus | undefined => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  // 終了後（endDate がある場合のみ）
  if (end && now >= end) return "finished"

  // 作業中（endDate がある場合のみ）
  if (end && now >= start && now < end) return "ongoing"

  // 開始後で endDate なし → バッジなし
  if (now >= start) return undefined

  // 作業前：カレンダー日数の差で細分化する
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const diffDays = Math.round((startDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "today"
  if (diffDays === 1) return "tomorrow"
  if (diffDays <= 6)  return "this_week"
  if (diffDays <= 13) return "next_week"

  // 14日以降はカレンダーの月で判定する（日数ベースだと月跨ぎで誤表示になるため）
  const nowMonth  = now.getFullYear() * 12 + now.getMonth()
  const startMonth = start.getFullYear() * 12 + start.getMonth()
  const monthDiff = startMonth - nowMonth

  if (monthDiff === 0) return "this_month"
  if (monthDiff === 1) return "next_month"
  return "next_month_plus"
}

export const getStatusDisplay = (status: WorkStatus): WorkStatusDisplay =>
  STATUS_DISPLAY[status]

// ATTENDING × workStatus → 参加状態バッジのテキスト・クラスを返す
export const getAttendingBadge = (status: WorkStatus | undefined): { text: string; className: string } => {
  if (status === "ongoing")  return { text: "🟢 参加中",   className: "bg-green-100 text-green-800 border border-green-300 font-bold" }
  if (status === "finished") return { text: "✓ 参加済み", className: "bg-stone-100 text-stone-500 border border-stone-200" }
  return { text: "📅 参加予定", className: "bg-blue-50 text-blue-700 border border-blue-200" }
}

// APPROVED（未確定）× workStatus → バッジを返す
export const getApprovedBadge = (status: WorkStatus | undefined): { text: string; className: string } => {
  if (status === "finished") return { text: "✅ 承認済み", className: "bg-green-50 text-green-800 border border-green-200" }
  return { text: "📅 参加予定", className: "bg-blue-50 text-blue-700 border border-blue-200" }
}
