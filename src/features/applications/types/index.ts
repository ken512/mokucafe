// 申請ステータス
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

// 申請一覧の1件（オーナー向け）
export type Application = {
  id: number
  message: string | null
  status: ApplicationStatus
  createdAt: string
  user: {
    id: number
    name: string
    avatarUrl: string | null
  }
}

// POST /api/posts/[id]/applications のリクエスト型
export type CreateApplicationRequest = {
  message?: string
}

// PATCH /api/applications/[id] のリクエスト型
export type UpdateApplicationRequest = {
  status: "APPROVED" | "REJECTED"
}
