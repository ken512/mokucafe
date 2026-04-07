"use client"

import { MOCK_POSTS } from "../mocks/posts"

// 募集一覧を取得するhook
// TODO: DBスキーマ確定後、SWR + fetch("/api/posts") に切り替える
export const usePosts = () => {
  return { posts: MOCK_POSTS, isLoading: false, error: null }
}
