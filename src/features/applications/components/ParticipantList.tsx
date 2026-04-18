"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Avatar from "@/components/ui/Avatar"

type Participant = {
  id: number
  name: string
  avatarUrl: string | null
}

type Props = {
  postId: number
}

// AVATAR_LIMIT 件までアバターを重ねて表示し、超過分は "+N人" で示す
const AVATAR_LIMIT = 5

// PostDetail に表示する承認済み参加者一覧
const ParticipantList = ({ postId }: Props) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsLoading(false)
        return
      }
      const res = await fetch(`/api/posts/${postId}/participants`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setParticipants(data.participants)
      }
      setIsLoading(false)
    }
    fetch_()
  }, [postId])

  // 未ログイン・ローディング・参加者ゼロはセクション自体を非表示にする
  if (isLoading || participants.length === 0) return null

  const visibleAvatars = participants.slice(0, AVATAR_LIMIT)
  const overflow = participants.length - AVATAR_LIMIT

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <p className="text-sm font-bold text-stone-800">
        ✅ 参加予定メンバー <span className="text-amber-800">{participants.length}人</span>
      </p>

      {/* アバター重ね表示 */}
      <div className="flex items-center">
        <div className="flex">
          {visibleAvatars.map((p, i) => (
            <div
              key={p.id}
              className="rounded-full ring-2 ring-white"
              style={{ marginLeft: i === 0 ? 0 : -10 }}
            >
              <Avatar name={p.name} avatarUrl={p.avatarUrl} size="sm" />
            </div>
          ))}
        </div>
        {overflow > 0 && (
          <span className="ml-2 text-xs text-stone-500 font-medium">+{overflow}人</span>
        )}
      </div>

      {/* 名前一覧 */}
      <div className="flex flex-col gap-2">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar name={p.name} avatarUrl={p.avatarUrl} size="sm" />
            <span className="text-sm text-stone-700">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ParticipantList
