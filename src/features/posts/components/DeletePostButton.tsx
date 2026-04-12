"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import { useDeletePost } from "../hooks/useDeletePost"

type Props = {
  postId: number
}

// 投稿削除ボタン＋確認ダイアログ（投稿者本人のみ表示）
const DeletePostButton = ({ postId }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { deletePost, isLoading, error } = useDeletePost()

  const handleConfirm = async () => {
    await deletePost(postId)
    // 削除失敗時はダイアログを開いたままエラーを表示する
  }

  return (
    <>
      {/* 削除ボタン */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        この募集を削除する
      </button>

      {/* 確認ダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isLoading && setIsDialogOpen(false)}
          />

          {/* モーダル本体 */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-stone-800">
                本当に削除しますか？
              </h2>
              <p className="text-sm text-stone-600">
                削除すると参加申請も含めてすべて消えます。この操作は取り消せません。
              </p>
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {isLoading ? "削除中..." : "削除する"}
              </button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DeletePostButton
