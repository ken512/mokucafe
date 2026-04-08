import Link from "next/link"

type Variant = "primary" | "outline" | "ghost" | "hero"
type Size = "sm" | "md" | "lg"

type Props = {
  href: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  className?: string
  children: React.ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: "bg-amber-900 hover:bg-amber-800 text-white",
  outline: "border border-amber-900 text-amber-900 hover:bg-amber-50",
  ghost:   "border border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-800",
  hero:    "bg-white text-amber-900 hover:bg-amber-50",
}

const sizeClass: Record<Size, string> = {
  sm: "text-xs px-4 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-sm py-3 px-6",
}

// Linkをボタン風に表示するコンポーネント
const ButtonLink = ({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
}: Props) => {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center font-medium rounded-full transition-colors",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  )
}

export default ButtonLink
