import { InputHTMLAttributes, forwardRef } from "react"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

// 汎用テキスト入力コンポーネント（react-hook-form の ref 転送対応）
const Input = forwardRef<HTMLInputElement, Props>(({ error, className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={[
        "border rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300",
        "focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900",
        "transition-colors w-full",
        error ? "border-red-300 focus:ring-red-300/30 focus:border-red-400" : "border-stone-200",
        className,
      ].join(" ")}
      {...props}
    />
  )
})

Input.displayName = "Input"

export default Input
