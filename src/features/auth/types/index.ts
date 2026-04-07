// 認証関連の型定義

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
