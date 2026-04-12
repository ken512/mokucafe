import { CreatePostRequest } from "../types"

// バリデーションエラーの型
type ValidationError = {
  field: string
  message: string
}

type ValidationResult =
  | { success: true; data: CreatePostRequest }
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

  // date
  if (typeof b.date !== "string" || isNaN(Date.parse(b.date))) {
    errors.push({ field: "date", message: "日時はISO8601形式で入力してください（例: 2025-05-01T10:00:00Z）" })
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
    }
  }

  if (errors.length > 0) return { success: false, errors }

  return {
    success: true,
    data: {
      cafeName: (b.cafeName as string).trim(),
      cafeAddress: b.cafeAddress as string | undefined,
      date: b.date as string,
      capacity: b.capacity as number,
      description: (b.description as string).trim(),
      tags: b.tags as string[],
      mediaUrls: (b.mediaUrls as string[] | undefined) ?? [],
    },
  }
}
