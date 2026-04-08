import { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "outline" | "ghost" | "hero"
type Size = "sm" | "md" | "lg"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  isLoading?: boolean
  loadingText?: string
}

const variantClass: Record<Variant, string> = {
  primary: "bg-amber-900 hover:bg-amber-800 text-white disabled:bg-stone-300",
  outline: "border border-amber-900 text-amber-900 hover:bg-amber-50",
  ghost:   "border border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-800 bg-white hover:bg-stone-50",
  hero:    "bg-white text-amber-900 hover:bg-amber-50",
}

const sizeClass: Record<Size, string> = {
  sm: "text-xs px-4 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-sm py-3 px-6",
}

// 汎用ボタンコンポーネント
const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingText,
  disabled,
  children,
  className = "",
  ...props
}: Props) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        "font-medium rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading && loadingText ? loadingText : children}
    </button>
  )
}

export default Button
