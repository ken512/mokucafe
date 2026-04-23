const TZ = "Asia/Tokyo"

// JST 固定フォーマット（サーバー・クライアントで結果を一致させ Hydration エラーを防ぐ）

export const formatDateTime = (isoString: string): string =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString)).replace(/\//g, "/")

export const formatShortDateTime = (isoString: string): string =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString))

export const formatTime = (isoString: string): string =>
  new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString))
