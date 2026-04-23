import { createHmac, timingSafeEqual } from "crypto"

const DOMAIN = "mokucafe-admin-v1"

// ADMIN_SECRET から HMAC-SHA256 署名済みセッショントークンを生成する
// Cookie には ADMIN_SECRET の値そのものではなく、このトークンを保存する
export const createAdminToken = (secret: string): string =>
  createHmac("sha256", secret).update(DOMAIN).digest("hex")

// Cookie のトークンと ADMIN_SECRET から期待値を生成して比較する（タイミング攻撃対策）
export const verifyAdminToken = (token: string, secret: string): boolean => {
  const expected = createAdminToken(secret)
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}
