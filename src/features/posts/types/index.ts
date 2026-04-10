// 募集投稿の型定義（DBスキーマ準拠）
export type Post = {
  id: number
  cafeName: string
  cafeAddress: string | null
  date: string // ISO8601
  capacity: number
  description: string
  tags: string[]
  status: "OPEN" | "CLOSED" | "DONE"
  createdAt: string
  host: {
    name: string
    avatarUrl: string | null
  }
  applicantCount: number
}

// GET /api/posts のレスポンス型
export type PostsResponse = {
  posts: Post[]
  nextCursor: number | null
}
