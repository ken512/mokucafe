---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---
# もくカフェ デザインシステム

## カラーパレット

| 用途 | クラス | 説明 |
|------|--------|------|
| ページ背景 | `bg-stone-100` | 落ち着いたウォームグレー |
| ヘッダー背景 | `bg-white border-b border-stone-200` | 清潔感のある白 |
| ヒーロー背景 | 実写カフェ画像 + `bg-amber-950/85` オーバーレイ | 濃いオーバーレイで文字を保護 |
| カード背景 | `bg-white` | stone-100 背景から浮き上がる |
| プライマリボタン | `bg-amber-900 hover:bg-amber-800 text-white` | コーヒーブラウン |
| ヒーロー内CTAボタン | `bg-white text-amber-900 hover:bg-amber-50` | 反転カラーで目立たせる |
| タグ | `bg-amber-50 text-amber-900 border border-amber-200` | 柔らかいアクセント |

## テキストカラー（コントラスト必須）

| 用途 | クラス | 使用場所 |
|------|--------|----------|
| 見出し | `text-stone-800` | カード・セクションタイトル |
| 本文・説明文 | `text-stone-800` | カード内の説明など（薄い色は使わない） |
| サブテキスト | `text-stone-600` | 投稿者名・補足情報 |
| ラベル・住所 | `text-amber-800 font-medium` | カフェ住所など |
| ヒーロー見出し | `text-white` | 暗い背景上 |
| ヒーロー本文 | `text-white` | 暗い背景上（stone-200 以下は使わない） |
| ヒーローアクセント | `text-amber-300` | キャッチフレーズなど |

> **NG**: `text-stone-400` / `text-stone-500` を本文・説明文に使わない。薄くて見えない。

## 画像の扱い

- 必ず `next/image` の `<Image />` を使う（`<img>` 禁止）
- 外部ドメインは `next.config.ts` の `images.remotePatterns` に追加する
- カフェ写真は Unsplash を使用（`images.unsplash.com` は設定済み）
- 写真の上にテキストを置く場合は必ずオーバーレイを重ねる
  - ヒーロー: `bg-amber-950/85`
  - カード写真: `bg-black/30`

## コンポーネントパターン

### ヒーローセクション
```
<section className="relative overflow-hidden">
  <Image fill className="object-cover" />          // カフェ実写
  <div className="absolute inset-0 bg-amber-950/85" />  // オーバーレイ
  <div className="relative ...">                    // コンテンツ（white文字）
```

### カード（PostCard）
```
<div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md">
  <div className="h-28 relative">  // 写真エリア + black/30 オーバーレイ
  <div className="p-4">            // コンテンツ（stone-800 文字）
```

### ヘッダー
```
<header className="bg-white border-b border-stone-200 sticky top-0 z-10">
```

## Unsplash 写真の選び方

- カフェ内装・コーヒーカップ・作業風景など「温かみのある」写真を選ぶ
- パラメータ: `?auto=format&fit=crop&w=600&q=80`（カード用）
- パラメータ: `?auto=format&fit=crop&w=1200&q=80`（ヒーロー用）
