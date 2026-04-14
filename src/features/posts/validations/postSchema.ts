import { CreatePostRequest, UpdatePostRequest } from "../types"

// Supabase Storage の post-media バケットの公開 URL プレフィックス
// 自プロジェクト以外の URL が mediaUrls に混入するのを防ぐ
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const ALLOWED_MEDIA_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/post-media/`

const isAllowedMediaUrl = (url: string): boolean =>
  SUPABASE_URL !== "" && url.startsWith(ALLOWED_MEDIA_PREFIX)

// バリデーションエラーの型
type ValidationError = {
  field: string
  message: string
}

type ValidationResult =
  | { success: true; data: CreatePostRequest }
  | { success: false; errors: ValidationError[] }

type UpdateValidationResult =
  | { success: true; data: UpdatePostRequest }
  | { success: false; errors: ValidationError[] }

// CreatePostRequest のバリデーション
// 新しいフィールドを追加する場合はここに追記する
export const validateCreatePost = (body: unknown): ValidationResult => {
  const errors: ValidationError[] = []

  if (typeof body !== "object" || body === null) {
    return { success: false, errors: [{ field: "body", message: "リクエストボディが不正です" }] }
  }

  const b = body as Record<string, unknown>

  // cafeName
  if (typeof b.cafeName !== "string" || b.cafeName.trim() === "") {
    errors.push({ field: "cafeName", message: "カフェ名は必須です" })
  }

  // cafeAddress（任意）
  if (b.cafeAddress !== undefined && typeof b.cafeAddress !== "string") {
    errors.push({ field: "cafeAddress", message: "住所は文字列で入力してください" })
  }

  // date（開始日時）
  if (typeof b.date !== "string" || isNaN(Date.parse(b.date))) {
    errors.push({ field: "date", message: "開始日時はISO8601形式で入力してください" })
  }

  // endDate（終了日時・必須）
  if (typeof b.endDate !== "string" || isNaN(Date.parse(b.endDate))) {
    errors.push({ field: "endDate", message: "終了日時はISO8601形式で入力してください" })
  } else if (typeof b.date === "string" && !isNaN(Date.parse(b.date))) {
    if (new Date(b.endDate) <= new Date(b.date as string)) {
      errors.push({ field: "endDate", message: "終了日時は開始日時より後に設定してください" })
    }
  }

  // capacity
  if (typeof b.capacity !== "number" || b.capacity < 1) {
    errors.push({ field: "capacity", message: "募集人数は1以上の数値で入力してください" })
  }

  // description
  if (typeof b.description !== "string" || b.description.trim() === "") {
    errors.push({ field: "description", message: "説明は必須です" })
  }

  // tags
  if (!Array.isArray(b.tags) || b.tags.some((t) => typeof t !== "string")) {
    errors.push({ field: "tags", message: "タグは文字列の配列で入力してください" })
  }

  // mediaUrls（任意・最大3件）
  if (b.mediaUrls !== undefined) {
    if (!Array.isArray(b.mediaUrls) || b.mediaUrls.some((u) => typeof u !== "string")) {
      errors.push({ field: "mediaUrls", message: "メディアURLは文字列の配列で入力してください" })
    } else if (b.mediaUrls.length > 3) {
      errors.push({ field: "mediaUrls", message: "メディアは最大3件まで登録できます" })
    } else if ((b.mediaUrls as string[]).some((u) => !isAllowedMediaUrl(u))) {
      errors.push({ field: "mediaUrls", message: "不正なメディアURLが含まれています" })
    }
  }

  if (errors.length > 0) return { success: false, errors }

  return {
    success: true,
    data: {
      cafeName: (b.cafeName as string).trim(),
      cafeAddress: b.cafeAddress as string | undefined,
      date: b.date as string,
      endDate: b.endDate as string,
      capacity: b.capacity as number,
      description: (b.description as string).trim(),
      tags: b.tags as string[],
      mediaUrls: (b.mediaUrls as string[] | undefined) ?? [],
    },
  }
}

// PATCH /api/posts/:id 用バリデーション（全フィールド任意・指定分のみ検証）
export const validateUpdatePost = (body: unknown): UpdateValidationResult => {
  if (typeof body !== "object" || body === null) {
    return { success: false, errors: [{ field: "body", message: "リクエストボディが不正です" }] }
  }

  const b = body as Record<string, unknown>
  const errors: ValidationError[] = []
  const data: UpdatePostRequest = {}

  if ("cafeName" in b) {
    if (typeof b.cafeName !== "string" || b.cafeName.trim() === "") {
      errors.push({ field: "cafeName", message: "カフェ名は必須です" })
    } else {
      data.cafeName = b.cafeName.trim()
    }
  }

  if ("cafeAddress" in b) {
    data.cafeAddress = typeof b.cafeAddress === "string" ? b.cafeAddress : undefined
  }

  if ("date" in b) {
    if (typeof b.date !== "string" || isNaN(Date.parse(b.date))) {
      errors.push({ field: "date", message: "開始日時はISO8601形式で入力してください" })
    } else {
      data.date = b.date
    }
  }

  if ("endDate" in b) {
    if (typeof b.endDate !== "string" || isNaN(Date.parse(b.endDate))) {
      errors.push({ field: "endDate", message: "終了日時はISO8601形式で入力してください" })
    } else if (data.date && new Date(b.endDate) <= new Date(data.date)) {
      errors.push({ field: "endDate", message: "終了日時は開始日時より後に設定してください" })
    } else {
      data.endDate = b.endDate
    }
  }

  if ("capacity" in b) {
    if (typeof b.capacity !== "number" || b.capacity < 1) {
      errors.push({ field: "capacity", message: "募集人数は1以上の数値で入力してください" })
    } else {
      data.capacity = b.capacity
    }
  }

  if ("description" in b) {
    if (typeof b.description !== "string" || b.description.trim() === "") {
      errors.push({ field: "description", message: "説明は必須です" })
    } else {
      data.description = b.description.trim()
    }
  }

  if ("tags" in b) {
    if (!Array.isArray(b.tags) || b.tags.some((t) => typeof t !== "string")) {
      errors.push({ field: "tags", message: "タグは文字列の配列で入力してください" })
    } else {
      data.tags = b.tags as string[]
    }
  }

  if ("mediaUrls" in b) {
    if (!Array.isArray(b.mediaUrls) || b.mediaUrls.some((u) => typeof u !== "string")) {
      errors.push({ field: "mediaUrls", message: "メディアURLは文字列の配列で入力してください" })
    } else if (b.mediaUrls.length > 3) {
      errors.push({ field: "mediaUrls", message: "メディアは最大3件まで登録できます" })
    } else if ((b.mediaUrls as string[]).some((u) => !isAllowedMediaUrl(u))) {
      errors.push({ field: "mediaUrls", message: "不正なメディアURLが含まれています" })
    } else {
      data.mediaUrls = b.mediaUrls as string[]
    }
  }

  if (errors.length > 0) return { success: false, errors }
  return { success: true, data }
}
