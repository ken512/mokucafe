"use client"

import { useForm } from "react-hook-form"
import Link from "next/link"
import { useLogin } from "../hooks/useLogin"
import { LoginFormValues } from "../types"
import Button from "@/components/ui/Button"
import FormField from "@/components/ui/FormField"
import ErrorAlert from "@/components/ui/ErrorAlert"
import Dialog from "@/components/ui/Dialog"

type Props = { redirectTo?: string }

const LoginForm = ({ redirectTo }: Props) => {
  const { login, isLoading, error, dialog, isOpen, closeDialog } = useLogin(redirectTo)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()

  return (
    <>
      <form onSubmit={handleSubmit(login)} className="flex flex-col gap-5">
        {error && <ErrorAlert message={error} />}

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
          })}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="ログイン中...">
          ログインする
        </Button>

        <p className="text-center text-sm text-stone-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="text-amber-900 font-medium hover:underline">
            新規登録
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

export default LoginForm
