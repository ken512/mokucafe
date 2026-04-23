"use client"

import { useState } from "react"
import ProfileView from "./ProfileView"
import ProfileEditForm from "./ProfileEditForm"
import Dialog from "@/components/ui/Dialog"
import { Profile } from "../types"

type Mode = "view" | "edit"

type Props = {
  initialProfile: Profile
}

// プロフィールページのクライアント部分（表示/編集モードの切り替えを管理する）
const ProfilePageClient = ({ initialProfile }: Props) => {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [mode, setMode] = useState<Mode>("view")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleSave = (updated: Profile) => {
    setProfile(updated)
    setMode("view")
    setShowSuccessDialog(true)
  }

  return (
    <>
      {/* 保存完了ダイアログ：閉じたらフルリロードしてヘッダーのアバターも更新する */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => { window.location.reload() }}
        variant="success"
        title="プロフィールを更新しました！"
        message="変更内容が保存されました。"
      />

      {mode === "view" ? (
        <ProfileView profile={profile} onEditClick={() => setMode("edit")} />
      ) : (
        <ProfileEditForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setMode("view")}
        />
      )}
    </>
  )
}

export default ProfilePageClient
