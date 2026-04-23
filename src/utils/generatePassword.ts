// 暗号論的に安全なランダムパスワードを生成する
export const generatePassword = (length = 12): string => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%&*"
  const all = upper + lower + numbers + symbols

  const randomIndex = (max: number) => {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }

  // 各種別から最低1文字ずつ含める
  const required = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    numbers[randomIndex(numbers.length)],
    symbols[randomIndex(symbols.length)],
  ]

  const rest = Array.from({ length: length - required.length }, () =>
    all[randomIndex(all.length)]
  )

  // Fisher-Yates シャッフル
  const chars = [...required, ...rest]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join("")
}
