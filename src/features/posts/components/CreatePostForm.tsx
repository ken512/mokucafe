"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import FormField from "@/components/ui/FormField"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import Dialog from "@/components/ui/Dialog"
import NumberInput from "@/components/ui/NumberInput"
import CafeAutocompleteInput from "./CafeAutocompleteInput"
import MediaUploader from "./MediaUploader"
import { useCreatePost } from "../hooks/useCreatePost"
import { useEagerUpload } from "../hooks/useEagerUpload"
import { CreatePostRequest } from "../types"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type FormValues = Omit<CreatePostRequest, "tags" | "mediaUrls"> & {
  date: string
  endDate: string
}

// 募集投稿フォームコンポーネント
const CreatePostForm = () => {
  const router = useRouter()
  const { createPost, isLoading, error, successPostId } = useCreatePost()
  const { upload, remove, isAllDone, getUrls, getState } = useEagerUpload()
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

  // 画像が追加されたら即座にバックグラウンドでアップロードを開始する
  useEffect(() => {
    for (const file of images) {
      if (!getState(file)) {
        upload(file, "image")
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  // 動画が追加されたら即座にバックグラウンドでアップロードを開始する
  useEffect(() => {
    if (video && !getState(video)) {
      upload(video, "video")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  const handleImagesChange = (files: File[]) => {
    // 削除されたファイルをアップロード状態から除去する
    const removed = images.filter(f => !files.includes(f))
    removed.forEach(remove)
    setImages(files)
  }

  const handleVideoChange = (file: File | null) => {
    if (video && !file) remove(video)
    setVideo(file)
  }

  const handlePlaceSelect = (suggestion: PlaceSuggestion) => {
    setValue("cafeAddress", suggestion.address, { shouldValidate: true })
    setCafePlaceId(suggestion.placeId)
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

  const onSubmit = (values: FormValues) => {
    const allFiles = [...images, ...(video ? [video] : [])]

    // アップロードがまだ完了していない場合は待つ
    if (!isAllDone(allFiles)) return

    const mediaUrls = getUrls(allFiles) ?? []
    createPost({
      ...values,
      date: new Date(values.date).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      capacity: Number(values.capacity),
      cafePlaceId,
      tags,
      mediaUrls,
    })
  }

  const allFiles = [...images, ...(video ? [video] : [])]
  const isUploading = allFiles.length > 0 && !isAllDone(allFiles)

  return (
    <>
      <Dialog
        isOpen={successPostId !== null}
        onClose={() => router.push(`/posts/${successPostId}`)}
        variant="success"
        title="募集を投稿しました！"
        message="仲間が見つかることを願っています☕"
        closeLabel="投稿を確認する"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && <ErrorAlert message={error} />}

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

        <FormField
          label="住所（任意）"
          htmlFor="cafeAddress"
          placeholder="カフェ名を選択すると自動入力されます"
          errorMessage={errors.cafeAddress?.message}
          {...register("cafeAddress")}
        />

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

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700">募集人数</label>
          <Controller
            name="capacity"
            control={control}
            defaultValue={2}
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">
            タグ（任意・最大5個）
          </span>

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

        <MediaUploader
          images={images}
          video={video}
          onImagesChange={handleImagesChange}
          onVideoChange={handleVideoChange}
          getFileState={getState}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading || isUploading}
          loadingText={isUploading ? "写真をアップロード中..." : "投稿中..."}
          className="mt-2"
        >
          募集を投稿する
        </Button>
      </form>
    </>
  )
}

export default CreatePostForm
