"use client"

import Image from "next/image"
import ButtonLink from "@/components/ui/ButtonLink"
import PostList from "@/features/posts/components/PostList"
import NotificationSetupBanner from "@/components/ui/NotificationSetupBanner"

const HOW_IT_WORKS = [
  { icon: "📍", label: "カフェで投稿" },
  { icon: "👋", label: "参加申請" },
  { icon: "☕", label: "作業スタート" },
]

// Unsplash: 温かいカフェ内装
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-100">
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

            <div className="flex flex-col gap-3">
              <ButtonLink href="/posts/new" variant="hero" size="lg" className="self-start font-semibold">
                募集を投稿する
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* 通知設定バナー */}
        <section className="max-w-2xl mx-auto w-full px-4 pt-6">
          <NotificationSetupBanner />
        </section>

        {/* 募集一覧セクション */}
        <section className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-700">現在の募集</h2>
            <ButtonLink href="/posts" variant="ghost" size="sm">
              すべて見る →
            </ButtonLink>
          </div>
          <PostList />
        </section>
      </main>
    </div>
  )
}

export default Home
