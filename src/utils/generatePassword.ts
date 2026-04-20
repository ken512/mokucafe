// ランダムな強いパスワードを生成する
export const generatePassword = (length = 12): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%&*"
  const all = upper + lower + numbers + symbols

  // 各種別から最低1文字ずつ含める
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  const rest = Array.from({ length: length - required.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  )

  // シャッフルして返す
  return [...required, ...rest]
    .sort(() => Math.random() - 0.5)
    .join("")
}
