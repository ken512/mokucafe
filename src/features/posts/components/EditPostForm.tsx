"use client"

import { useState, KeyboardEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import Image from "next/image"
import FormField from "@/components/ui/FormField"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import NumberInput from "@/components/ui/NumberInput"
import CafeAutocompleteInput from "./CafeAutocompleteInput"
import MediaUploader from "./MediaUploader"
import { useUpdatePost } from "../hooks/useUpdatePost"
import { Post } from "../types"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type FormValues = {
  cafeName: string
  cafeAddress?: string
  date: string
  endDate: string
  capacity: number
}

type Props = {
  post: Post
  onSaved: (updated: Post) => void
  onCancel: () => void
}

// "2026-04-11T05:00:00.000Z" → "2026-04-11T14:00"（datetime-local 用にローカル時間へ変換）
const toDatetimeLocalValue = (isoString: string): string => {
  const d = new Date(isoString)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

// URLの拡張子から動画かどうかを判定する
const isVideoUrl = (url: string): boolean =>
  /\.(mp4|mov|webm)(\?.*)?$/i.test(url)

// 既存投稿を編集するフォームコンポーネント
const EditPostForm = ({ post, onSaved, onCancel }: Props) => {
  const { updatePost, isLoading, error } = useUpdatePost()

  // 既存メディアのうち残すURL（初期値はすべて残す）
  const [keepMediaUrls, setKeepMediaUrls] = useState<string[]>(post.mediaUrls)
  // 新規追加ファイル
  const [newImages, setNewImages] = useState<File[]>([])
  const [newVideo, setNewVideo] = useState<File | null>(null)

  const [tags, setTags] = useState<string[]>(post.tags)
  const [tagInput, setTagInput] = useState("")
  const [description, setDescription] = useState(post.description)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      cafeName: post.cafeName,
      cafeAddress: post.cafeAddress ?? "",
      date: toDatetimeLocalValue(post.date),
      endDate: post.endDate ? toDatetimeLocalValue(post.endDate) : "",
      capacity: post.capacity,
    },
  })

  const handlePlaceSelect = (suggestion: PlaceSuggestion) => {
    setValue("cafeAddress", suggestion.address, { shouldValidate: true })
  }

  // 既存メディアを削除する
  const removeExistingMedia = (url: string) => {
    setKeepMediaUrls((prev) => prev.filter((u) => u !== url))
  }

  // 追加できる画像・動画の残り枠数を計算する
  const existingImageCount = keepMediaUrls.filter((u) => !isVideoUrl(u)).length
  const existingVideoCount = keepMediaUrls.filter((u) => isVideoUrl(u)).length
  const hasExistingVideo = existingVideoCount > 0

  // MediaUploader に渡す onChange（新規追加枠の制限を計算）
  // 既存分 + 新規分の合計が上限を超えないよう制限する
  const handleNewImagesChange = (files: File[]) => {
    const maxNew = 2 - existingImageCount
    setNewImages(files.slice(0, maxNew))
  }

  const handleNewVideoChange = (file: File | null) => {
    // 既存動画が残っていれば新規動画は追加不可
    if (hasExistingVideo) return
    setNewVideo(file)
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return
    e.preventDefault()
    addTag()
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    setTagInput("")
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return
    setTags([...tags, trimmed])
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const onSubmit = async (values: FormValues) => {
    const updated = await updatePost({
      postId: post.id,
      cafeName: values.cafeName,
      cafeAddress: values.cafeAddress,
      date: new Date(values.date).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      capacity: values.capacity,
      description,
      tags,
      keepMediaUrls,
      newImages,
      newVideo,
    })
    if (updated) onSaved(updated)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {error && <ErrorAlert message={error} />}

      {/* カフェ名 */}
      <div className="flex flex-col gap-1.5">
        <Controller
          name="cafeName"
          control={control}
          rules={{ required: "カフェ名を入力してください" }}
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

      {/* カフェ住所 */}
      <FormField
        label="住所（任意）"
        htmlFor="cafeAddress"
        placeholder="カフェ名を選択すると自動入力されます"
        errorMessage={errors.cafeAddress?.message}
        {...register("cafeAddress")}
      />

      {/* 作業開始日時・終了日時 */}
      <div className="flex flex-col gap-3">
        <FormField
          label="作業開始日時"
          htmlFor="date"
          type="datetime-local"
          errorMessage={errors.date?.message}
          {...register("date", { required: "開始日時を選択してください" })}
        />
        <FormField
          label="作業終了日時"
          htmlFor="endDate"
          type="datetime-local"
          errorMessage={errors.endDate?.message}
          {...register("endDate", {
            required: "終了日時を選択してください",
            validate: (v) => {
              const start = (document.getElementById("date") as HTMLInputElement)?.value
              if (start && v && new Date(v) <= new Date(start)) {
                return "終了日時は開始日時より後に設定してください"
              }
              return true
            },
          })}
        />
      </div>

      {/* 募集人数 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">募集人数</label>
        <Controller
          name="capacity"
          control={control}
          rules={{ required: "募集人数を入力してください" }}
          render={({ field }) => (
            <NumberInput
              id="capacity"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={20}
              error={!!errors.capacity}
            />
          )}
        />
        {errors.capacity && (
          <p className="text-xs text-red-500">{errors.capacity.message}</p>
        )}
      </div>

      {/* 作業内容・説明 */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          作業内容・ひとこと
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例：ポートフォリオ作成中です。一緒に作業できる方を探しています！"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors w-full resize-none"
        />
      </div>

      {/* タグ */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-stone-700">タグ（任意・最大5個）</span>
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

      {/* 既存メディアの表示・削除 */}
      {keepMediaUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">登録済みの写真・動画</span>
          <div className="flex flex-wrap gap-3">
            {keepMediaUrls.map((url) => (
              <div
                key={url}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200"
              >
                {isVideoUrl(url) ? (
                  <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center">
                    <span className="text-2xl">🎬</span>
                    <span className="text-xs text-stone-500 mt-1">動画</span>
                  </div>
                ) : (
                  <Image
                    src={url}
                    alt="登録済みの写真"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeExistingMedia(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新規メディア追加（枠に余裕があるときのみ表示） */}
      {(existingImageCount < 2 || (!hasExistingVideo && !newVideo)) && (
        <MediaUploader
          images={newImages}
          video={hasExistingVideo ? null : newVideo}
          onImagesChange={handleNewImagesChange}
          onVideoChange={handleNewVideoChange}
        />
      )}

      {/* ボタン */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText="更新中..."
        >
          更新する
        </Button>
      </div>
    </form>
  )
}

export default EditPostForm
