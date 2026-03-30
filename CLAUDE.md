@AGENTS.md
# もくカフェ

カフェで作業仲間を見つけるアプリ。ハッカソン個人開発。

## 技術スタック
- React + Next.js + TypeScript
- Prisma + Supabase PostgreSQL
- Supabase Auth
- Vercel
- Gemini API（Gemini 2.5 Flash）
- Google Places API

## コーディングルール
- コンポーネントは関数コンポーネント（アロー関数）で統一
- any型の使用禁止
- 単一原則に沿って、コンポーネントを作成
- フォームはreact-hook-formを使用
- コメントは日本語で記述
- 変数名・関数名はキャメルケース（camelCase）
- 

## コマンド
- 開発サーバー: npm run dev
- DBマイグレーション: npm run prisma:push:dev
- ビルド: npm run build


## MVPスコープ
募集投稿〜参加申請の流れのみ。マッチング機能は対象外。

## ディレクトリ構成

```
mokucafe/
├── prisma/
│   └── schema.prisma          # DBスキーマ定義
├── public/                    # 静的ファイル（画像など）
├── src/
│   ├── app/                   # ルーティング層（Next.js App Router）
│   │   ├── api/ai/
│   │   │   ├── generate-post/ # POST /api/ai/generate-post（AI募集文生成）
│   │   │   └── matching/      # POST /api/ai/matching（AI相性マッチング）
│   │   ├── login/             # /login
│   │   ├── register/          # /register
│   │   ├── posts/
│   │   │   ├── [id]/          # /posts/:id
│   │   │   └── new/           # /posts/new
│   │   ├── profile/           # /profile
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                # 共有UIコンポーネント（Button, Modalなど）
│   ├── config/                # アプリ全体で使う定数（タグ一覧など）
│   ├── features/              # 機能単位のモジュール（bulletproof-react）
│   │   ├── auth/              # 認証
│   │   ├── posts/             # 募集投稿
│   │   ├── applications/      # 参加申請
│   │   └── profile/           # プロフィール
│   │       └── (各feature内) components/ hooks/ types/
│   ├── hooks/                 # 共有カスタムフック
│   ├── lib/                   # 外部ライブラリ初期化（Prisma, Supabase）
│   ├── types/                 # 共有TypeScript型定義
│   └── utils/                 # 汎用ユーティリティ関数
└── .claude/
    ├── commands/              # カスタムスラッシュコマンド
    ├── rules/                 # モジュール型の追加指示
    ├── skills/                # 自律起動ワークフロー
    └── agents/                # 専門分業エージェント
```

## 注意事項
- APIキーはサーバーサイドのみで呼び出す
- Prisma MigrateはSupabaseと競合しないよう注意
- TypeScript strict モードがオン。
- 未使用の import は即エラーになる
```

---

**`.claude/commands/`（よく使う作業をコマンド化）**

ハッカソンで繰り返す作業をスラッシュコマンドにしておくと時短になります。
```
.claude/commands/
├── review.md        → /project:review
├── db-migrate.md    → /project:db-migrate  
└── deploy-check.md  → /project:deploy-check