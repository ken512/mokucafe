"use client"

import { useState, KeyboardEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import FormField from "@/components/ui/FormField"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import CafeAutocompleteInput from "./CafeAutocompleteInput"
import MediaUploader from "./MediaUploader"
import { useCreatePost } from "../hooks/useCreatePost"
import { CreatePostRequest } from "../types"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

// react-hook-form 用のフォーム値型（date・capacity は変換が必要なため string で受け取る）
type FormValues = Omit<CreatePostRequest, "capacity" | "tags" | "mediaUrls"> & {
  capacity: string
}

// 募集投稿フォームコンポーネント
const CreatePostForm = () => {
  const { createPost, isLoading, error } = useCreatePost()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [cafePlaceId, setCafePlaceId] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>()

  // Places Autocomplete で候補を選択したとき、住所フィールドを自動入力する
  // cafeName は Controller 経由で onChange が呼ばれるため setValue 不要
  const handlePlaceSelect = (suggestion: PlaceSuggestion) => {
    setValue("cafeAddress", suggestion.address, { shouldValidate: true })
    setCafePlaceId(suggestion.placeId)
  }

  // Enterキーでタグを追加する（フォーム送信は防ぐ）
  // isComposing チェックで日本語IME変換確定時の誤発火を防ぐ
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return
    e.preventDefault()
    addTag()
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    setTagInput("")
    // 空・重複・5個以上は追加しない
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return
    setTags([...tags, trimmed])
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const onSubmit = (values: FormValues) => {
    createPost({
      ...values,
      // datetime-local の値（"2026-04-15T10:00"）を ISO8601 に変換する
      date: new Date(values.date).toISOString(),
      capacity: Number(values.capacity),
      cafePlaceId,
      tags,
      images,
      video,
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && <ErrorAlert message={error} />}

        {/* カフェ名（Controller で react-hook-form と接続） */}
        <div className="flex flex-col gap-1.5">
          <Controller
            name="cafeName"
            control={control}
            rules={{ required: "カフェ名を入力してください" }}
            defaultValue=""
            render={({ field }) => (
              <CafeAutocompleteInput
                value={field.value}
                onChange={field.onChange}
                onSelect={handlePlaceSelect}
                error={!!errors.cafeName}
              />
            )}
          />
          {errors.cafeName && (
            <p className="text-xs text-red-500">{errors.cafeName.message}</p>
          )}
        </div>

        {/* カフェ住所（Autocomplete で自動入力・手動入力も可） */}
        <FormField
          label="住所（任意）"
          htmlFor="cafeAddress"
          placeholder="カフェ名を選択すると自動入力されます"
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

        {/* タグ（自由入力・最大5個） */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">
            タグ（任意・最大5個）
          </span>

          {/* 追加済みタグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-900 text-white"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:opacity-70 transition-opacity"
                    aria-label={`${tag}を削除`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* タグ入力欄（5個未満のときのみ表示） */}
          {tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="例：もくもく作業"
                maxLength={20}
                className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                追加
              </button>
            </div>
          )}
          <p className="text-xs text-stone-400">Enterまたは「追加」ボタンでタグを追加できます</p>
        </div>

        {/* 写真・動画アップロード */}
        <MediaUploader
          images={images}
          video={video}
          onImagesChange={setImages}
          onVideoChange={setVideo}
        />

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
    </>
  )
}

export default CreatePostForm
