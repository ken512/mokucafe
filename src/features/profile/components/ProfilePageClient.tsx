"use client"

import { useState } from "react"
import ProfileView from "./ProfileView"
import ProfileEditForm from "./ProfileEditForm"
import { Profile } from "../types"

type Mode = "view" | "edit"

type Props = {
  initialProfile: Profile
}

// プロフィールページのクライアント部分（表示/編集モードの切り替えを管理する）
const ProfilePageClient = ({ initialProfile }: Props) => {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [mode, setMode] = useState<Mode>("view")

  const handleSave = (updated: Profile) => {
    setProfile(updated)
    setMode("view")
  }

  if (mode === "view") {
    return <ProfileView profile={profile} onEditClick={() => setMode("edit")} />
  }

  return (
    <ProfileEditForm
      profile={profile}
      onSave={handleSave}
      onCancel={() => setMode("view")}
    />
  )
}

export default ProfilePageClient
