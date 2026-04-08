"use client"

import { useForm } from "react-hook-form"
import Link from "next/link"
import { useSignup } from "../hooks/useSignup"
import { SignupFormValues } from "../types"
import Button from "@/components/ui/Button"
import FormField from "@/components/ui/FormField"
import ErrorAlert from "@/components/ui/ErrorAlert"
import Dialog from "@/components/ui/Dialog"

const SignupForm = () => {
  const { signup, isLoading, error, dialog, isOpen, closeDialog } = useSignup()
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<SignupFormValues>()

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

        {/* パスワード：変更時にconfirmPasswordを再バリデート */}
        <FormField
          label="パスワード"
          htmlFor="password"
          type="password"
          placeholder="••••••••"
          errorMessage={errors.password?.message}
          {...register("password", {
            required: "パスワードを入力してください",
            minLength: {
              value: 6,
              message: "パスワードは6文字以上で入力してください",
            },
            onChange: () => trigger("confirmPassword"),
          })}
        />

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
