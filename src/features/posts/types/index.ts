// POST /api/posts のリクエスト型
export type CreatePostRequest = {
  cafeName: string
  cafeAddress?: string
  cafePlaceId?: string // Google Places の placeId（任意）
  date: string    // 作業開始日時（ISO8601）
  endDate: string // 作業終了日時（ISO8601）
  capacity: number
  description: string
  tags: string[]
  mediaUrls?: string[] // アップロード済みメディアの公開URL（最大3件）
}

// POST /api/posts のレスポンス型
export type CreatePostResponse = {
  post: Post
}

// 募集投稿の型定義（DBスキーマ準拠）
export type Post = {
  id: number
  cafeName: string
  cafeAddress: string | null
  cafePlaceId: string | null
  date: string    // 作業開始日時（ISO8601）
  endDate: string | null // 作業終了日時（ISO8601）
  capacity: number
  description: string
  tags: string[]
  mediaUrls: string[] // カフェ写真・動画の公開URL（最大3件）
  status: "OPEN" | "CLOSED" | "DONE"
  createdAt: string
  host: {
    name: string
    avatarUrl: string | null
  }
  applicantCount: number
}

// PATCH /api/posts/:id のリクエスト型（全フィールド任意）
export type UpdatePostRequest = {
  cafeName?: string
  cafeAddress?: string
  cafePlaceId?: string
  date?: string
  endDate?: string
  capacity?: number
  description?: string
  tags?: string[]
  mediaUrls?: string[]
}

// GET /api/posts のレスポンス型
export type PostsResponse = {
  posts: Post[]
  nextCursor: number | null
}
