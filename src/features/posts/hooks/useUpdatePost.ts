"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Post, UpdatePostRequest } from "../types"
import { compressImage, validateVideoSize, validateFileType } from "../utils/compressImage"

const BUCKET = "post-media"

// 1ファイルをSupabase Storageにアップロードして公開URLを返す
const uploadFile = async (
  file: File,
  supabaseUserId: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> => {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${supabaseUserId}/${timestamp}_${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false })

  if (error) throw new Error(`アップロード失敗: ${error.message}`)

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

type UpdatePostInput = Omit<UpdatePostRequest, "mediaUrls"> & {
  postId: number
  keepMediaUrls: string[] // 残す既存メディアのURL
  newImages: File[]       // 追加する画像ファイル
  newVideo: File | null   // 追加する動画ファイル
}

// 募集投稿更新 hook
export const useUpdatePost = () => {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePost = async ({
    postId,
    keepMediaUrls,
    newImages,
    newVideo,
    ...values
  }: UpdatePostInput): Promise<Post | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("ログインが必要です")
        return null
      }

      // ファイルの MIME タイプを検証する（許可形式以外はアップロードしない）
      newImages.forEach((f) => validateFileType(f, "image"))
      if (newVideo) {
        validateFileType(newVideo, "video")
        // 動画のサイズを事前に検証する（50MB超はエラー）
        validateVideoSize(newVideo)
      }

      // 画像を圧縮してからアップロードする
      const compressedImages = await Promise.all(newImages.map(compressImage))
      const newMediaFiles = [...compressedImages, ...(newVideo ? [newVideo] : [])]
      const newMediaUrls = await Promise.all(
        newMediaFiles.map((file) => uploadFile(file, session.user.id, supabase))
      )

      // 残す既存URL ＋ 新規アップロードURLを結合する
      const mediaUrls = [...keepMediaUrls, ...newMediaUrls]

      const body: UpdatePostRequest = {
        ...values,
        mediaUrls,
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "更新に失敗しました")
        return null
      }

      const data = await res.json()
      return data.post as Post
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { updatePost, isLoading, error }
}
