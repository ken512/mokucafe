"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/ui/Header"
import PostCard from "@/features/posts/components/PostCard"
import { usePosts } from "@/features/posts/hooks/usePosts"

const HOW_IT_WORKS = [
  { icon: "📍", label: "カフェで投稿" },
  { icon: "👋", label: "参加申請" },
  { icon: "☕", label: "作業スタート" },
]

// Unsplash: 温かいカフェ内装
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"

const Home = () => {
  const { posts, isLoading } = usePosts()

  return (
    <div className="min-h-screen bg-stone-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <Header />
      </div>

      <main className="flex flex-col">
        {/* ヒーローセクション：カフェ写真 + 濃いオーバーレイ（min-h でfill画像の高さを保証） */}
        <section className="relative overflow-hidden min-h-64">
          {/* 背景写真 */}
          <Image
            src={HERO_IMAGE_URL}
            alt="カフェの雰囲気"
            fill
            className="object-cover"
            priority
          />
          {/* 読みやすさのための暗いオーバーレイ */}
          <div className="absolute inset-0 bg-amber-950/85" />

          <div className="relative max-w-2xl mx-auto px-4 py-14 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-amber-300 text-xs font-medium tracking-widest uppercase">
                もくカフェ
              </p>
              <h1 className="text-white text-2xl font-bold leading-snug">
                カフェで、今日だけの<br />
                作業仲間を見つけよう
              </h1>
              {/* 白文字で視認性を最大化 */}
              <p className="text-white text-sm leading-relaxed">
                「今日ここで一緒に作業しませんか？」を<br />
                気軽に投稿・申請できるアプリです。
              </p>
            </div>

            {/* 3ステップ */}
            <div className="flex gap-2 flex-wrap">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                  <span className="text-sm">{step.icon}</span>
                  <span className="text-xs text-white whitespace-nowrap">{step.label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/posts/new"
              className="self-start bg-white text-amber-900 hover:bg-amber-50 font-semibold text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              募集を投稿する
            </Link>
          </div>
        </section>

        {/* 募集一覧セクション */}
        <section className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-700">現在の募集</h2>
            <span className="text-xs text-amber-900 font-medium">すべて見る</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-28 bg-stone-200" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-3 bg-stone-200 rounded w-1/3" />
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-4xl mb-3">☕</p>
              <p className="text-sm">今日の募集はまだありません</p>
              <p className="text-sm mt-1">最初の募集を投稿してみましょう！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Home
