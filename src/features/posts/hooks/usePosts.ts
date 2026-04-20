"use client"

import useSWRInfinite from "swr/infinite"
import { Post, PostsResponse } from "../types"

const LIMIT = 10

const fetcher = (url: string): Promise<PostsResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("取得に失敗しました")
    return res.json()
  })

type FilterParams = {
  q?: string   // カフェ名・住所・説明文のあいまい検索
  tag?: string // タグの完全一致フィルター
}

// ページインデックスとひとつ前のレスポンスからURLを生成
const makeGetKey = (params: FilterParams) =>
  (pageIndex: number, previousPageData: PostsResponse | null) => {
    if (previousPageData && previousPageData.nextCursor === null) return null
    const qs = new URLSearchParams({ limit: String(LIMIT) })
    if (params.q) qs.set("q", params.q)
    if (params.tag) qs.set("tag", params.tag)
    if (pageIndex > 0 && previousPageData?.nextCursor) {
      qs.set("cursor", String(previousPageData.nextCursor))
    }
    return `/api/posts?${qs.toString()}`
  }

export const usePosts = (params: FilterParams = {}) => {
  const { data, error, isLoading, size, setSize, isValidating } =
    useSWRInfinite<PostsResponse>(makeGetKey(params), fetcher, {
      // タブ復帰時の再フェッチを無効化（チラつき防止）
      revalidateOnFocus: false,
      // 再接続時の再フェッチを無効化
      revalidateOnReconnect: false,
      // フィルター変更時に前のデータを保持して一覧が消えないようにする
      keepPreviousData: true,
      // 同一URLのリクエストを10秒間dedupする
      dedupingInterval: 10000,
    })

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
