"use client"

import { useState } from "react"
import PostDetail from "./PostDetail"
import EditPostForm from "./EditPostForm"
import Dialog from "@/components/ui/Dialog"
import { Post } from "../types"

type Props = {
  initialPost: Post
  isLoggedIn: boolean
  isOwner: boolean
}

// 詳細表示 ↔ 編集モードを切り替えるクライアントコンポーネント
const PostDetailPageClient = ({ initialPost, isLoggedIn, isOwner }: Props) => {
  const [post, setPost] = useState<Post>(initialPost)
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleSaved = (updated: Post) => {
    setPost(updated)
    setIsEditing(false)
    setShowSuccessDialog(true)
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-stone-800">募集を編集する</h2>
        <EditPostForm
          post={post}
          onSaved={handleSaved}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 編集完了ダイアログ */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        variant="success"
        title="募集内容を更新しました！"
        message="変更が反映されました。"
      />
      {/* オーナーに編集ボタンを表示する */}
      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full transition-colors"
          >
            ✏️ 編集する
          </button>
        </div>
      )}
      <PostDetail post={post} isLoggedIn={isLoggedIn} isOwner={isOwner} />
    </div>
  )
}

export default PostDetailPageClient
