"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CreatePostRequest, CreatePostResponse } from "../types"
import { compressImage, validateVideoSize } from "../utils/compressImage"

const BUCKET = "post-media"

// 1ファイルをSupabase Storageにアップロードして公開URLを返す
// パス: post-media/{supabaseUserId}/{timestamp}_{safeName}
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

type CreatePostInput = Omit<CreatePostRequest, "mediaUrls"> & {
  images: File[]     // 画像ファイル（最大2枚）
  video: File | null // 動画ファイル（最大1本）
}

// 募集投稿作成 hook
export const useCreatePost = () => {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = async ({ images, video, ...values }: CreatePostInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // Supabase セッションからアクセストークンを取得する
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("ログインが必要です")
        return
      }

      // 動画のサイズを事前に検証する（50MB超はエラー）
      if (video) validateVideoSize(video)

      // 画像を圧縮してからアップロードする（長辺1280px・JPEG品質0.82）
      const compressedImages = await Promise.all(images.map(compressImage))

      // 圧縮済み画像→動画の順でアップロードしてURLを取得する
      const mediaFiles = [...compressedImages, ...(video ? [video] : [])]
      const mediaUrls = await Promise.all(
        mediaFiles.map((file) => uploadFile(file, session.user.id, supabase))
      )

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ...values, mediaUrls }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "投稿に失敗しました")
        return
      }

      const data: CreatePostResponse = await res.json()
      // 投稿詳細ページへ遷移する
      router.push(`/posts/${data.post.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました。時間をおいて再度お試しください")
    } finally {
      setIsLoading(false)
    }
  }

  return { createPost, isLoading, error }
}
