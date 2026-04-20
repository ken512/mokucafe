"use client"

import { useCallback } from "react"

type Props = {
  id?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  error?: boolean
}

// 上下矢印ボタン付き数値入力（手入力・ボタン操作どちらも対応）
const NumberInput = ({ id, value, onChange, min = 1, max = 20, error }: Props) => {
  const decrement = useCallback(() => {
    if (value > min) onChange(value - 1)
  }, [value, min, onChange])

  const increment = useCallback(() => {
    if (value < max) onChange(value + 1)
  }, [value, max, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value)
    if (isNaN(parsed)) return
    const clamped = Math.min(Math.max(parsed, min), max)
    onChange(clamped)
  }

  return (
    <div className={[
      "flex w-28 border rounded-xl overflow-hidden transition-colors",
      "focus-within:ring-2 focus-within:ring-amber-900/30 focus-within:border-amber-900",
      error ? "border-red-300" : "border-stone-200",
    ].join(" ")}>
      {/* 数値入力欄 */}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        // ブラウザネイティブのスピナーを非表示にして独自ボタンを使う
        className="flex-1 min-w-0 px-3 py-3 text-sm text-stone-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      {/* 上下矢印ボタン（デスクトップのスピナーと同じ配置） */}
      <div className="flex flex-col border-l border-stone-200">
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label="増やす"
          className="flex-1 flex items-center justify-center px-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-b border-stone-200"
        >
          <svg viewBox="0 0 10 6" className="w-2.5 h-2.5" fill="currentColor">
            <path d="M0 6L5 0L10 6H0Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label="減らす"
          className="flex-1 flex items-center justify-center px-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg viewBox="0 0 10 6" className="w-2.5 h-2.5" fill="currentColor">
            <path d="M0 0L5 6L10 0H0Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default NumberInput
