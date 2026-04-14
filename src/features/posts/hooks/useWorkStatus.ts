"use client"

import { useState, useEffect } from "react"
import { calcWorkStatus, WorkStatus } from "../utils/postStatus"

// 1分ごとに現在時刻を更新してリアルタイムステータスを返すフック
export const useWorkStatus = (
  startDate: string,
  endDate: string | null
): WorkStatus | undefined => {
  const [status, setStatus] = useState<WorkStatus | undefined>(
    calcWorkStatus(startDate, endDate)
  )

  useEffect(() => {
    if (!endDate) return

    // 1分ごとにステータスを再計算する
    const timer = setInterval(() => {
      setStatus(calcWorkStatus(startDate, endDate))
    }, 60_000)

    return () => clearInterval(timer)
  }, [startDate, endDate])

  return status
}
