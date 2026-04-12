"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Button from "@/components/ui/Button"
import ErrorAlert from "@/components/ui/ErrorAlert"
import { useUpdateProfile } from "../hooks/useUpdateProfile"
import { Profile } from "../types"

type Props = {
  profile: Profile
  onSave: (updated: Profile) => void
  onCancel: () => void
}

// プロフィール編集フォームコンポーネント
const ProfileEditForm = ({ profile, onSave, onCancel }: Props) => {
  const { updateProfile, isLoading, error } = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio ?? "")
  const [xUrl, setXUrl] = useState(profile.xUrl ?? "")
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl ?? "")
  const [threadsUrl, setThreadsUrl] = useState(profile.threadsUrl ?? "")
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "")

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const updated = await updateProfile({
      name,
      bio,
      xUrl,
      instagramUrl,
      threadsUrl,
      githubUrl,
      avatarFile,
    })
    if (updated) onSave(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <h2 className="text-base font-bold text-stone-800">プロフィールを編集</h2>

      {error && <ErrorAlert message={error} />}

      {/* アバター画像 */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-stone-200 hover:opacity-80 transition-opacity"
        >
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="アバター"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-900 text-white text-3xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {/* カメラオーバーレイ */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xl">📷</span>
          </div>
        </button>
        <p className="text-xs text-stone-400">タップして画像を変更</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarSelect}
        />
      </div>

      {/* ユーザー名 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">ユーザー名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          placeholder="名前を入力してください"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors"
        />
      </div>

      {/* 自己紹介 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">自己紹介</label>
          <span className={`text-xs ${bio.length > 500 ? "text-red-500" : "text-stone-400"}`}>
            {bio.length} / 500
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="自己紹介を書いてみましょう（500文字以内）"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors resize-none"
        />
      </div>

      {/* SNS URL */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-stone-700">SNS リンク（任意）</p>
        {[
          { label: "X (Twitter)", value: xUrl, onChange: setXUrl, placeholder: "https://x.com/username" },
          { label: "Instagram", value: instagramUrl, onChange: setInstagramUrl, placeholder: "https://instagram.com/username" },
          { label: "Threads", value: threadsUrl, onChange: setThreadsUrl, placeholder: "https://threads.net/@username" },
          { label: "GitHub（エンジニアの方はぜひ！）", value: githubUrl, onChange: setGithubUrl, placeholder: "https://github.com/username" },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs text-stone-500">{label}</label>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* ボタン */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          loadingText="保存中..."
          disabled={bio.length > 500}
        >
          保存する
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}

export default ProfileEditForm
