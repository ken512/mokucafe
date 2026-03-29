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
（実際の構成を書く）

## 注意事項
- APIキーはサーバーサイドのみで呼び出す
- Prisma MigrateはSupabaseと競合しないよう注意
```

---

**`.claude/commands/`（よく使う作業をコマンド化）**

ハッカソンで繰り返す作業をスラッシュコマンドにしておくと時短になります。
```
.claude/commands/
├── review.md        → /project:review
├── db-migrate.md    → /project:db-migrate  
└── deploy-check.md  → /project:deploy-check