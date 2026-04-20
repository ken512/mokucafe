import { cache } from "react"
import { createClient } from "./server"

// React cache() でリクエスト内の getUser() 呼び出しを重複排除する
// layout と page が同じリクエストで呼んでも Supabase への通信は1回になる
export const getUser = cache(async () => {
  const supabase = await createClient()
  return supabase.auth.getUser()
})
