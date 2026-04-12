// プロフィールの型定義（DBスキーマ準拠）
export type Profile = {
  id: number
  name: string
  bio: string | null
  avatarUrl: string | null
  xUrl: string | null
  instagramUrl: string | null
  threadsUrl: string | null
  githubUrl: string | null
}

// PATCH /api/profile のリクエスト型（全フィールド任意）
export type UpdateProfileRequest = {
  name?: string
  bio?: string
  avatarUrl?: string
  xUrl?: string
  instagramUrl?: string
  threadsUrl?: string
  githubUrl?: string
}
