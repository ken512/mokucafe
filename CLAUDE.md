@AGENTS.md
@.claude/rules/git-rules.md
@.claude/rules/review-checklist.md
@.claude/skills/pr-workflow.md

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
- Reactコンポーネントファイル名はPascalCaseで始める
- TypeScriptファイル名はキャメルケース（camelCase）で始める

## コマンド
- 開発サーバー: npm run dev
- DBマイグレーション: npm run prisma:push:dev
- ビルド: npm run build

## 規約



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
│   │   ├── posts/　　　　　　　m
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

# Claude Code ルール

## Gitブランチ運用
- mainブランチ：リリース用（直接pushしない）
- developブランチ：開発用（機能はここに積み上げる）

## PR作成ルール

### PRを作成する前に必ず以下をレビューすること
- [ ] セキュリティ上の問題がないか
  - 認証・認可の漏れ
  - 機密情報のハードコードがないか
  - SQLインジェクション・XSSのリスク
- [ ] ロジックがおかしくないか
  - 処理の流れが意図通りか
  - エッジケースの考慮があるか
- [ ] インシデントリスクがないか
  - 既存機能への影響範囲
  - データの破壊・消失リスク
- [ ] 命名規則が適切か
  - 変数名・関数名が意図を表しているか
  - 省略しすぎていないか

### レビューが完了したらPRを作成し、マージまで実行すること

## コミットコメントのルール

### 言語
- 必ず日本語で書くこと

### フォーマット
以下の構成で書くこと：

---
## 作業目的
（なぜこの変更をするのか）

## 変更内容
| # | ファイル | 変更内容 | コミットID |
|---|---------|---------|-----------|
| 1 | `src/xxx/yyy.ts` | 変更の概要 | [abc1234](https://github.com/{owner}/{repo}/commit/abc1234) |
| 2 | `src/xxx/zzz.ts` | 変更の概要 | [def5678](https://github.com/{owner}/{repo}/commit/def5678) |

## エビデンス
（動作確認内容、テスト結果など）

---

### 例

---
## 作業目的
ログイン時のバリデーション漏れを修正するため

## 変更内容
| # | ファイル | 変更内容 | コミットID |
|---|---------|---------|-----------|
| 1 | `src/auth/login.ts` | メールアドレスの形式チェックを追加 | [abc1234](https://github.com/ken512/mokucafe/commit/abc1234) |
| 2 | `src/auth/validation.ts` | validateEmail関数を新規追加 | [def5678](https://github.com/ken512/mokucafe/commit/def5678) |

## エビデンス
- 不正なメールアドレスでログイン試行 → エラー表示を確認
- 正常なメールアドレスでログイン → 成功を確認

---

## 注意事項
- APIキーはサーバーサイドのみで呼び出す
- Prisma MigrateはSupabaseと競合しないよう注意
- TypeScript strict モードがオン。
- 未使用の import は即エラーになる

