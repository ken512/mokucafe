"use client"

import { useState, useEffect } from "react"
import { calcWorkStatus, WorkStatus } from "../utils/postStatus"

// 1分ごとに現在時刻を更新してリアルタイムステータスを返すフック
// 初期値を undefined にしてマウント後に計算することで SSR との hydration mismatch を防ぐ
export const useWorkStatus = (
  startDate: string,
  endDate: string | null
): WorkStatus | undefined => {
  const [status, setStatus] = useState<WorkStatus | undefined>(undefined)

  useEffect(() => {
    // マウント後に初回計算（サーバーと一致させるため useEffect 内で行う）
    setStatus(calcWorkStatus(startDate, endDate))

    if (!endDate) return

    // 1分ごとにステータスを再計算する
    const timer = setInterval(() => {
      setStatus(calcWorkStatus(startDate, endDate))
    }, 60_000)

    return () => clearInterval(timer)
  }, [startDate, endDate])

  return status
}
