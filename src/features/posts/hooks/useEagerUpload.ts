"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { compressImage, validateVideoSize, validateFileType } from "../utils/compressImage"

const BUCKET = "post-media"

type UploadStatus = "uploading" | "done" | "error"

type FileUploadState = {
  status: UploadStatus
  url?: string
  error?: string
}

// ファイルをSupabase Storageにアップロードして公開URLを返す
const uploadToStorage = async (
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

// ファイル選択と同時にバックグラウンドでアップロードを開始するhook
// 送信時には既にアップロード済みのURLをそのまま使うため待ち時間がゼロになる
export const useEagerUpload = () => {
  const supabase = createClient()
  // File オブジェクトをキーにしてアップロード状態を管理する
  const [states, setStates] = useState<Map<File, FileUploadState>>(new Map())

  const upload = useCallback(async (file: File, type: "image" | "video") => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // バリデーション（失敗はエラー状態にしてUIに伝える）
    try {
      validateFileType(file, type)
      if (type === "video") validateVideoSize(file)
    } catch (e: unknown) {
      setStates(prev => new Map(prev).set(file, {
        status: "error",
        error: e instanceof Error ? e.message : "ファイル形式エラー",
      }))
      return
    }

    setStates(prev => new Map(prev).set(file, { status: "uploading" }))

    try {
      // 画像は圧縮してからアップロードする（動画はそのまま）
      const toUpload = type === "image" ? await compressImage(file) : file
      const url = await uploadToStorage(toUpload, session.user.id, supabase)
      setStates(prev => new Map(prev).set(file, { status: "done", url }))
    } catch (e: unknown) {
      setStates(prev => new Map(prev).set(file, {
        status: "error",
        error: e instanceof Error ? e.message : "アップロードに失敗しました",
      }))
    }
  }, [supabase])

  const remove = useCallback((file: File) => {
    setStates(prev => {
      const next = new Map(prev)
      next.delete(file)
      return next
    })
  }, [])

  // 全ファイルのアップロードが完了しているか
  const isAllDone = (files: File[]) =>
    files.every(f => states.get(f)?.status === "done")

  // アップロード済みURLを順序通りに返す（未完了の場合はundefined）
  const getUrls = (files: File[]): string[] | null => {
    const urls: string[] = []
    for (const f of files) {
      const url = states.get(f)?.url
      if (!url) return null
      urls.push(url)
    }
    return urls
  }

  const getState = (file: File) => states.get(file)

  return { upload, remove, isAllDone, getUrls, getState }
}
