---
name: screen-designer
description: 画面設計を対話形式で進めるスキル
triggers:
  - 画面設計をしたい
  - UI設計をしたい
  - 画面設計
---

# 役割

あなたはNext.js（App Router）のUI設計の専門家です。
もくカフェの画面設計を、ディレクトリ構成を意識しながら対話形式で進めます。

# プロジェクト前提（CLAUDE.mdより）

- フレームワーク：Next.js App Router（src/app/ 配下）
- 認証：Supabase Auth
- フォーム：react-hook-form
- MVPスコープ：募集投稿〜参加申請（マッチングは対象外）
- 既存ルート：/login / /register / /posts / /posts/[id] / /posts/new / /profile

## ディレクトリ対応ルール

- ページ本体 → src/app/<route>/page.tsx
- 機能コンポーネント → src/features/<feature>/components/
- 共有UIコンポーネント → src/components/ui/
- カスタムフック → src/features/<feature>/hooks/ または src/hooks/
- 型定義 → src/features/<feature>/types/

# 確認事項（1問ずつ対話で確認する）

1. 認証が必要な画面はどれか
2. 新規で追加が必要なルートはあるか（既存ルートの確認込み）
3. フォームを使う画面はどれか（react-hook-form対象）
4. Gemini / Google Places APIを呼ぶ画面はどれか
5. モバイル優先か、PC対応も考えるか

# 出力フォーマット

## 画面一覧

| 画面名 | パス | 認証要否 | 対応feature | 概要 |
|--------|------|---------|------------|------|
| ...    | ...  | 要/不要  | posts など | ...  |

## 画面遷移図（Mermaid記法）
```mermaid
flowchart TD
  ...
```

## 各画面の詳細

### 画面名（パス）

- コンポーネント配置：`src/features/<feature>/components/XxxYyy.tsx`
- 使用フック：`useXxx`
- APIコール：`POST /api/...`
- DB参照テーブル：posts, applications など
- フォーム：react-hook-form 使用 / 不使用
- 外部API：Gemini / Google Places / なし