"use client"

import { useForm } from "react-hook-form"
import Link from "next/link"
import { useLogin } from "../hooks/useLogin"
import { LoginFormValues } from "../types"

const LoginForm = () => {
  const { login, isLoading, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()

  return (
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-5">
      {/* サーバーエラー */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* メールアドレス */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-700">メールアドレス</label>
        <input
          id="email"
          type="email"
          placeholder="example@email.com"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900"
          {...register("email", {
            required: "メールアドレスを入力してください",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "正しいメールアドレスを入力してください",
            },
          })}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* パスワード */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-700">パスワード</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900"
          {...register("password", {
            required: "パスワードを入力してください",
            minLength: {
              value: 6,
              message: "パスワードは6文字以上で入力してください",
            },
          })}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-amber-900 hover:bg-amber-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition-colors text-sm"
      >
        {isLoading ? "ログイン中..." : "ログインする"}
      </button>

      {/* 新規登録へ */}
      <p className="text-center text-sm text-stone-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-amber-900 font-medium hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
