---
name: pr-workflow
description: PR作成・マージ作業。コードの実装完了時、ブランチの作業完了時、
  またはユーザーが「PRを作って」「マージして」「pushして」
  「レビューして」などに言及した際に使用する。
  「developをmainにマージ」などの発言があった際に使用する。
allowed-tools: Bash, Read, Write
---

## 全体フロー
1. 変更をステージング
2. コミット
3. リモートにpush
4. レビュー実行
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
review-checklist.mdの手順に従いレビューを実行すること。

## Step4. PR作成

### PR本文フォーマット
## 作業目的
（なぜこの変更をするのか）

## 変更内容
| # | ファイル | 変更内容 | コミットID |
|---|---------|---------|-----------|
| 1 | `src/xxx/yyy.ts` | 変更の概要 | [abc1234](https://github.com/ken512/mokucafe/commit/abc1234) |

## エビデンス
（動作確認内容、テスト結果など）

## Step5. マージ〜後処理
- Squash mergeで実行すること
- マージ後にブランチを削除すること

!`git checkout develop`
!`git pull origin develop`
```
