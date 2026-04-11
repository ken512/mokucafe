// 認証関連の型定義

// POST /api/users のリクエスト型
export type CreateUserRequest = {
  name: string
}

// POST /api/users のレスポンス型
export type CreateUserResponse = {
  user: {
    id: number
    name: string
  }
}

export type LoginFormValues = {
  email: string
  password: string
}

export type SignupFormValues = {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}
