// 募集投稿の型定義
export type Post = {
  id: string
  cafeName: string
  cafeAddress: string
  hostName: string
  hostAvatarUrl?: string
  cafeImageUrl?: string  // カフェの写真URL
  description: string
  tags: string[]
  startTime: string // "14:00" 形式
  endTime: string   // "17:00" 形式
  maxParticipants: number
  currentParticipants: number
  createdAt: string
}
