// Edge Runtime / Node.js 両対応（Web Crypto API を使用）
// Node.js crypto はミドルウェアの Edge Runtime で使用不可なため Web Crypto API に統一

const DOMAIN = "mokucafe-admin-v1"

const hexEncode = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

const importKey = (secret: string) =>
  crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

export const createAdminToken = async (secret: string): Promise<string> => {
  const key = await importKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(DOMAIN))
  return hexEncode(sig)
}

// タイミング攻撃対策：全文字を XOR してから判定する
export const verifyAdminToken = async (token: string, secret: string): Promise<boolean> => {
  const expected = await createAdminToken(secret)
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}
