# もくカフェ

カフェで作業仲間を見つけるアプリ。

---

## 開発者向け情報

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- Supabase プロジェクト（PostgreSQL）
- Gemini API キー
- Google Places API キー

### 依存パッケージのインストール

```bash
npm install
```

### 環境変数の設定

`.env` ファイルをプロジェクトルートに作成し、以下の変数を設定してください。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini API
GEMINI_API_KEY=

# Google Places API
GOOGLE_PLACES_API_KEY=
```

### ローカルサーバーの起動

```bash
npm run dev
```

サーバー起動後、[http://localhost:3000](http://localhost:3000) でアプリにアクセスできます。

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React / Next.js / TypeScript |
| スタイリング | Tailwind CSS |
| フォーム | React Hook Form |
| ORM | Prisma |
| データベース | Supabase PostgreSQL |
| 認証 | Supabase Auth |
| AI | Gemini API（Gemini 2.5 Flash）|
| 地図・場所 | Google Places API |
| デプロイ | Vercel |

---

## プロジェクト構成

このプロジェクトは、スケーラビリティとメンテナンス性を確保するために [bulletproof-react](https://github.com/alan2207/bulletproof-react) のアーキテクチャを採用しています。ファイルの種類ではなく**機能（feature）ごとにファイルを整理する**ことを基本思想としています。

```
src/
├── app/              # アプリケーション層（レイアウト、ページ、Route Handler）
├── components/       # 共有のUIコンポーネント（例: Button, Modal）
├── features/         # 機能ベースのモジュール（例: 認証、募集投稿）
├── config/           # タグ一覧など、アプリ全体で使う定数
├── hooks/            # 共有のカスタムフック
├── lib/              # 設定済みのライブラリ（例: Prisma, Supabase）
├── types/            # 共有のTypeScript型定義
└── utils/            # 共有の便利関数
```

### 主要な原則

- **機能第一（Feature-First）**: 特定の機能に関連するコードは `src/features` 内の専用ディレクトリにまとめて配置します。
- **共有とローカルの分離**: 複数の機能で再利用されるコードは共有ディレクトリ（`components`, `hooks` など）に配置します。単一の機能でのみ使用されるコードは、その機能のディレクトリ内に配置します。
- **疎結合**: 各機能は可能な限り独立しているべきです。機能間の直接インポート（例: `src/features/a` が `src/features/b` からインポートする）は避けてください。
