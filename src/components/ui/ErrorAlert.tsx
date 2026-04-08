type Props = {
  message: string
}

// サーバーエラー・フォームエラー表示コンポーネント
const ErrorAlert = ({ message }: Props) => {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {message}
    </p>
  )
}

export default ErrorAlert
