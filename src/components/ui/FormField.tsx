import { InputHTMLAttributes, forwardRef } from "react"
import Input from "./Input"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  htmlFor: string
  errorMessage?: string
}

// ラベル + 入力欄 + エラー文をまとめたフォームフィールド
const FormField = forwardRef<HTMLInputElement, Props>(({ label, htmlFor, errorMessage, ...inputProps }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <Input ref={ref} id={htmlFor} error={!!errorMessage} {...inputProps} />
      {errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  )
})

FormField.displayName = "FormField"

export default FormField
