// 申請ステータス
export type ApplicationStatus = "PENDING" | "APPROVED" | "ATTENDING" | "REJECTED"

// 申請一覧の1件（オーナー向け）
export type Application = {
  id: number
  message: string | null
  status: ApplicationStatus
  createdAt: string
  guestName?: string | null
  user: {
    id: number
    name: string
    avatarUrl: string | null
  } | null
}

// POST /api/posts/[id]/applications のリクエスト型
export type CreateApplicationRequest = {
  name?: string
  message?: string
}

// PATCH /api/applications/[id] のリクエスト型
export type UpdateApplicationRequest = {
  status: "APPROVED" | "REJECTED"
}

// 登録不要の申請情報
export type GuestApplication = {
  name: string
  status: ApplicationStatus
  post: { id: number; cafeName: string; date: string; endDate: string | null }
}
