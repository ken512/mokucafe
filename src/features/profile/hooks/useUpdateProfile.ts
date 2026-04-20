"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Profile, UpdateProfileRequest } from "../types"
import { compressImage } from "@/features/posts/utils/compressImage"

const AVATAR_BUCKET = "avatars"

// アバター画像をSupabase Storageにアップロードして公開URLを返す
const uploadAvatar = async (
  file: File,
  supabaseUserId: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> => {
  const compressed = await compressImage(file)
  const path = `${supabaseUserId}/avatar.jpg`

  // upsert: true で上書きアップロードする（アバターは常に1枚）
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, compressed, { upsert: true })

  if (error) throw new Error(`アバターのアップロードに失敗しました: ${error.message}`)

  // キャッシュバスティングのためタイムスタンプをクエリに付与する
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

type UpdateProfileInput = UpdateProfileRequest & {
  avatarFile?: File | null // 新しいアバター画像（選択された場合のみ）
}

// プロフィール更新 hook
export const useUpdateProfile = () => {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (input: UpdateProfileInput): Promise<Profile | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("ログインが必要です")
        return null
      }

      // アバター画像が選択されていればアップロードしてURLを取得する
      let avatarUrl: string | undefined
      if (input.avatarFile) {
        avatarUrl = await uploadAvatar(input.avatarFile, session.user.id, supabase)
      }

      const { avatarFile: _, ...profileData } = input
      const body: UpdateProfileRequest = {
        ...profileData,
        ...(avatarUrl ? { avatarUrl } : {}),
      }

      const res = await fetch("/api/profile", {
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
      return data.profile as Profile
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { updateProfile, isLoading, error }
}
