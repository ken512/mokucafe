// 募集投稿で選択できるタグ一覧
export const POST_TAGS = [
  "もくもく作業",
  "会話OK",
  "静かめ希望",
  "初心者OK",
  "エンジニア",
  "デザイン",
  "勉強・資格",
  "副業・フリーランス",
  "読書",
  "その他",
] as const

export type PostTag = (typeof POST_TAGS)[number]
