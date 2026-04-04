@AGENTS.md
@.claude/agents/code-reviewer.md
@.claude/agents/security-auditor.md
@.claude/commands/review.md
@.claude/pr-workflow/SKILL.md

# もくカフェ

カフェで作業仲間を見つけるアプリ。ハッカソン個人開発。

## 技術スタック
- React + Next.js + TypeScript
- Prisma + Supabase PostgreSQL
- Supabase Auth
- Vercel
- Gemini API（Gemini 2.5 Flash）
- Google Places API

## コマンド
- 開発サーバー: npm run dev
- DBマイグレーション: npm run prisma:push:dev
- ビルド: npm run build

## 規約

### 設計スキル

設計作業はスキルを使って対話形式で進める。
スキルファイルは `.claude/skills/` に配置されている。

| 作業     | トリガーワード        | スキルファイル                             |
| -------- | ------------------- | ---------------------------------------- |
| 要件定義 | 「要件定義をしたい」  | .claude/skills/requirements-definer.md  |
| DB設計   | 「DB設計をしたい」   | .claude/skills/db-designer.md           |
| 画面設計 | 「画面設計をしたい」 | .claude/skills/screen-designer.md       |

- 対話は1〜2問ずつ進める。一度に大量の質問をしない
- 確認が完了してからMarkdownの設計書を出力する
- 出力された設計書は `docs/` ディレクトリに保存する

### MCPサーバー

詳細ルールは `.claude/rules/mcp.md` を参照。

- **Supabase MCP**：DBの参照・確認に使う。本番データの直接変更は禁止
- **Context7 MCP**：Next.js / Prisma / Supabase 実装時は必ず最新ドキュメントを取得してから回答する


### MCP サーバー

#### Supabase MCP

Claude は Supabase MCP を通じてデータベースに直接アクセスできる。

**許可する操作**

- テーブル構造・スキーマの参照
- レコードの読み取り（SELECT）
- マイグレーション前後のデータ確認
- ログ・エラーの確認

**禁止する操作**

- 本番データの直接更新・削除（UPDATE / DELETE / DROP）
- スキーマの直接変更（必ず Prisma マイグレーション経由で行う）
- 他プロジェクトへのアクセス（本アプリのプロジェクトのみ）

**使用例**
```
「postsテーブルのレコード数を確認して」
「マイグレーション後にデータが壊れていないか確認して」
「applicationsテーブルの構造を見せて」
```

---

#### Context7 MCP

ライブラリの最新ドキュメントを取得するために使用する。

**使用するタイミング**

- Next.js / Prisma / Supabase の実装時は必ず最新ドキュメントを取得してから回答する
- react-hook-form の API を参照するとき
- バージョンアップ後の変更点が不明なとき

**使用しないタイミング**

- プロジェクト固有の実装（ドキュメントに存在しない）
- 単純なTypeScript / JavaScript の質問

**使用例**
```
「Prisma の最新の upsert の書き方を調べてから実装して」
「Supabase Auth の最新ドキュメントを参照して実装して」
```


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

## 作業目的
ログイン時のバリデーション漏れを修正するため


## エビデンス
- 不正なメールアドレスでログイン試行 → エラー表示を確認
- 正常なメールアドレスでログイン → 成功を確認

## 注意事項
- APIキーはサーバーサイドのみで呼び出す
- Prisma MigrateはSupabaseと競合しないよう注意
- TypeScript strict モードがオン。
- 未使用の import は即エラーになる