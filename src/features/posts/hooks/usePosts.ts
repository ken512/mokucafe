"use client"

import useSWRInfinite from "swr/infinite"
import { Post, PostsResponse } from "../types"

const LIMIT = 10

const fetcher = (url: string): Promise<PostsResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("取得に失敗しました")
    return res.json()
  })

// ページインデックスとひとつ前のレスポンスからURLを生成
const getKey = (
  pageIndex: number,
  previousPageData: PostsResponse | null
) => {
  // 前のページの nextCursor が null = 最終ページ → これ以上取得しない
  if (previousPageData && previousPageData.nextCursor === null) return null
  if (pageIndex === 0) return `/api/posts?limit=${LIMIT}`
  return `/api/posts?cursor=${previousPageData!.nextCursor}&limit=${LIMIT}`
}

export const usePosts = () => {
  const { data, error, isLoading, size, setSize, isValidating } =
    useSWRInfinite<PostsResponse>(getKey, fetcher)

  const posts: Post[] = data ? data.flatMap((page) => page.posts) : []
  // 追加ページをロード中かどうか（初回ロードとは区別する）
  const isLoadingMore = isValidating && size > 1
  const hasMore = data
    ? data[data.length - 1]?.nextCursor !== null
    : false

  return {
    posts,
    isLoading,
    error,
    isLoadingMore,
    hasMore,
    loadMore: () => setSize(size + 1),
  }
}
