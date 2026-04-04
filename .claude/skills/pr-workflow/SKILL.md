---
name: pr-workflow
description: PR作成・マージ作業。コードの実装完了時、ブランチの作業完了時、
  またはユーザーが「PRを作って」「マージして」「pushして」
  「レビューして」などに言及した際に使用する。
  「developをmainにマージ」などの発言があった際に使用する。
allowed-tools: Bash, Read, Write, Agent
---

## 全体フロー
1. 変更をステージング
2. コミット
3. リモートにpush
4. レビュー実行（code-reviewer・security-auditorエージェント）
5. PR作成
6. マージ

## Step1. ステージング〜コミット

!`git status`
!`git diff`
!`git add .`

※ .envや機密情報が含まれていないか確認してからステージングすること。

!`git commit -m "<type>: <変更内容を日本語で>"`

## Step2. リモートにpush

!`git push origin develop`

## Step3. レビュー実行

以下の2つのエージェントを呼び出してレビューを実行すること。

- `code-reviewer`エージェント：ロジック・命名・インシデントリスクを確認
- `security-auditor`エージェント：認証・機密情報・脆弱性を確認

レビューで「高」または「Critical・High」の問題が検出された場合はPR作成を中断し、ユーザーに報告すること。

## Step4. PR作成

タイトルは日本語で記載すること。
以下のコマンドでPRを作成すること。

!`gh pr create --title "<日本語タイトル>" --body "$(cat <<'EOF'
## 作業目的
（なぜこの変更をするのか）

## 変更内容
| # | ファイル | 変更内容 | コミットID |
|---|---------|---------|-----------|
| 1 | \`src/xxx/yyy.ts\` | 変更の概要 | [abc1234](https://github.com/ken512/mokucafe/commit/abc1234) |

## エビデンス
（動作確認内容、テスト結果など）
EOF
)"`

## Step5. マージ〜後処理

Squash mergeでマージすること。

!`gh pr merge --squash --auto`

マージ後にdevelopを最新に更新すること。

!`git checkout develop`
!`git pull origin develop`
