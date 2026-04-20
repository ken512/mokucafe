"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useSignup } from "../hooks/useSignup"
import { SignupFormValues } from "../types"
import Button from "@/components/ui/Button"
import FormField from "@/components/ui/FormField"
import ErrorAlert from "@/components/ui/ErrorAlert"
import Dialog from "@/components/ui/Dialog"
import { generatePassword } from "@/utils/generatePassword"

const SignupForm = () => {
  const { signup, isLoading, error, dialog, isOpen, closeDialog } = useSignup()
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SignupFormValues>()

  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  // パスワードを自動生成してフォームにセットする
  const handleGeneratePassword = async () => {
    const pwd = generatePassword(12)
    setValue("password", pwd)
    setValue("confirmPassword", pwd)
    setShowPassword(true)
    await trigger(["password", "confirmPassword"])
  }

  // 生成したパスワードをクリップボードにコピーする
  const handleCopy = async () => {
    const pwd = getValues("password")
    if (!pwd) return
    await navigator.clipboard.writeText(pwd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <form onSubmit={handleSubmit(signup)} className="flex flex-col gap-5">
        {error && <ErrorAlert message={error} />}

        <FormField
          label="表示名"
          htmlFor="displayName"
          type="text"
          placeholder="田中 りな"
          errorMessage={errors.displayName?.message}
          {...register("displayName", {
            required: "表示名を入力してください",
            maxLength: {
              value: 20,
              message: "表示名は20文字以内で入力してください",
            },
          })}
        />

        <FormField
          label="メールアドレス"
          htmlFor="email"
          type="email"
          placeholder="example@email.com"
          errorMessage={errors.email?.message}
          {...register("email", {
            required: "メールアドレスを入力してください",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "正しいメールアドレスを入力してください",
            },
          })}
        />

        {/* パスワード */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              パスワード
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-xs text-amber-900 font-medium hover:underline"
            >
              🔑 パスワードを自動生成する
            </button>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-800 pr-20 outline-none focus:ring-2 focus:ring-amber-900/30 transition ${
                errors.password ? "border-red-400" : "border-stone-200"
              }`}
              {...register("password", {
                required: "パスワードを入力してください",
                minLength: {
                  value: 8,
                  message: "パスワードは8文字以上で入力してください",
                },
                onChange: () => trigger("confirmPassword"),
              })}
            />
            {/* コピー・表示切替ボタン */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                title="コピー"
              >
                <span className="text-sm">{copied ? "✅" : "📋"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                title={showPassword ? "非表示" : "表示"}
              >
                <span className="text-sm">{showPassword ? "🙈" : "👁️"}</span>
              </button>
            </div>
          </div>

          {errors.password ? (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          ) : (
            <p className="text-xs text-stone-400">8文字以上で設定してください</p>
          )}
        </div>

        <FormField
          label="パスワード（確認）"
          htmlFor="confirmPassword"
          type="password"
          placeholder="••••••••"
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "パスワードを再入力してください",
            validate: (value) =>
              value === getValues("password") || "パスワードが一致しません",
          })}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="登録中...">
          アカウントを作成する
        </Button>

        <p className="text-center text-sm text-stone-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-amber-900 font-medium hover:underline">
            ログイン
          </Link>
        </p>
      </form>

      {dialog && (
        <Dialog
          isOpen={isOpen}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
        />
      )}
    </>
  )
}

export default SignupForm
