"use client"

import { useForm } from "react-hook-form"
import FormField from "@/components/ui/FormField"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import Dialog from "@/components/ui/Dialog"
import { POST_TAGS } from "@/config/tags"
import { useCreatePost } from "../hooks/useCreatePost"
import { CreatePostRequest } from "../types"

// react-hook-form 用のフォーム値型（date は string で受け取り ISO に変換する）
type FormValues = Omit<CreatePostRequest, "capacity"> & {
  capacity: string
}

// 募集投稿フォームコンポーネント
const CreatePostForm = () => {
  const { createPost, isLoading, error, dialog, isOpen, closeDialog } = useCreatePost()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (values: FormValues) => {
    createPost({
      ...values,
      // datetime-local の値（"2026-04-15T10:00"）を ISO8601 に変換する
      date: new Date(values.date).toISOString(),
      capacity: Number(values.capacity),
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && <ErrorAlert message={error} />}

        {/* カフェ名 */}
        <FormField
          label="カフェ名"
          htmlFor="cafeName"
          placeholder="例：スターバックス 渋谷店"
          errorMessage={errors.cafeName?.message}
          {...register("cafeName", { required: "カフェ名を入力してください" })}
        />

        {/* カフェ住所（任意） */}
        <FormField
          label="住所（任意）"
          htmlFor="cafeAddress"
          placeholder="例：渋谷区道玄坂2-24-1"
          errorMessage={errors.cafeAddress?.message}
          {...register("cafeAddress")}
        />

        {/* 作業日時 */}
        <FormField
          label="作業日時"
          htmlFor="date"
          type="datetime-local"
          errorMessage={errors.date?.message}
          {...register("date", { required: "作業日時を選択してください" })}
        />

        {/* 募集人数 */}
        <FormField
          label="募集人数"
          htmlFor="capacity"
          type="number"
          min={1}
          max={20}
          placeholder="例：3"
          errorMessage={errors.capacity?.message}
          {...register("capacity", {
            required: "募集人数を入力してください",
            min: { value: 1, message: "1人以上で入力してください" },
            max: { value: 20, message: "20人以下で入力してください" },
          })}
        />

        {/* 作業内容・説明 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-stone-700">
            作業内容・ひとこと
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="例：ポートフォリオ作成中です。一緒に作業できる方を探しています！"
            className={[
              "border rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300",
              "focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900",
              "transition-colors w-full resize-none",
              errors.description ? "border-red-300 focus:ring-red-300/30 focus:border-red-400" : "border-stone-200",
            ].join(" ")}
            {...register("description", { required: "作業内容を入力してください" })}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* タグ（複数選択） */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">雰囲気タグ</span>
          <div className="flex flex-wrap gap-2">
            {POST_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={tag}
                  className="hidden peer"
                  {...register("tags")}
                />
                {/* チェック状態でアクティブスタイルを適用 */}
                <span className="text-xs px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-900 peer-checked:bg-amber-900 peer-checked:text-white peer-checked:border-amber-900 transition-colors select-none">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText="投稿中..."
          className="mt-2"
        >
          募集を投稿する
        </Button>
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

export default CreatePostForm
