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

## 登録不要の参加申請

- 募集の投稿は登録・ログイン必須です。
- 未ログインの人は名前（1〜50文字）と任意のメッセージで応募できます。
- 応募完了時に本人専用の確認URLを表示します。保存したURLはSafari・Chrome・Edgeなど別のブラウザでも利用できます。
- 確認URLで承認状況を確認し、承認後に「参加する」を押すと参加確定となります。メール通知はありません。
- URLを知っている人は操作できるため、他の人に共有しないでください。URLを紛失した場合の再発行機能はありません。
- 募集の削除時には応募も削除され、確認URLは利用できなくなります（既存の自動削除も含む）。

### DBスキーマ反映

既存データを保持したまま、応募者IDを任意にし、ゲスト名・確認用トークンのハッシュを追加します。

```bash
npm run prisma:push:dev
npm run prisma:generate
```

### テスト

TypeScriptを直接実行できるNode.js 22.18以上を使用してください。

```bash
npm test
```
