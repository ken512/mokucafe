// 画像圧縮の設定
const MAX_SIZE_PX = 1280   // 長辺の最大ピクセル数
const JPEG_QUALITY = 0.82  // JPEG品質（0〜1）
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 動画の上限サイズ: 50MB

// Canvas API を使って画像をリサイズ＋JPEG再エンコードして File を返す
// 長辺が MAX_SIZE_PX を超える場合はアスペクト比を保ったまま縮小する
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const { naturalWidth: w, naturalHeight: h } = img

      // 長辺が上限以内なら圧縮のみ（リサイズなし）
      const scale = Math.min(1, MAX_SIZE_PX / Math.max(w, h))
      const canvasW = Math.round(w * scale)
      const canvasH = Math.round(h * scale)

      const canvas = document.createElement("canvas")
      canvas.width = canvasW
      canvas.height = canvasH

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas が使用できません"))
        return
      }

      ctx.drawImage(img, 0, 0, canvasW, canvasH)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("画像の圧縮に失敗しました"))
            return
          }
          // 元のファイル名を保持しつつ拡張子を .jpg に統一する
          const baseName = file.name.replace(/\.[^.]+$/, "")
          resolve(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }))
        },
        "image/jpeg",
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("画像の読み込みに失敗しました"))
    }

    img.src = objectUrl
  })
}

// 動画のファイルサイズを検証する（50MB超はエラー）
export const validateVideoSize = (file: File): void => {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`動画のサイズは50MB以内にしてください（現在: ${(file.size / 1024 / 1024).toFixed(1)}MB）`)
  }
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"]

// ファイルの MIME タイプを検証する（クライアント側の第一防御層）
export const validateFileType = (file: File, type: "image" | "video"): void => {
  const allowed = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
  if (!allowed.includes(file.type)) {
    throw new Error(
      type === "image"
        ? "写真はJPG・PNG・WebP形式のみアップロードできます"
        : "動画はMP4・MOV形式のみアップロードできます"
    )
  }
}
