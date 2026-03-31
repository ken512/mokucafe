# PR作成〜マージの手順

## 全体フロー
1. 変更をステージング
2. コミット
3. リモートにpush
4. レビュー実行
5. PR作成
6. マージ

---

## Step1. ステージング〜コミット

### 変更内容を確認
!`git status`
!`git diff`

### ステージング
!`git add .`

※ 不要なファイルが含まれていないか必ず確認してからステージングすること。
※ `.env` や機密情報を含むファイルが含まれていないか確認すること。

### コミット
コミットメッセージはgit-rules.mdのフォーマットに従うこと。

!`git commit -m "<type>: <変更内容を日本語で>"`

---

## Step2. リモートにpush

!`git push origin develop`

---

## Step3. レビュー実行
review-checklist.mdの手順に従いレビューを実行すること。

---

## Step4. PR作成

### PRタイトル
日本語で変更概要を記載すること。

### PR本文フォーマット
## 作業目的
（なぜこの変更をするのか）

## 変更内容
| # | ファイル | 変更内容 | コミットID |
|---|---------|---------|-----------|
| 1 | `src/xxx/yyy.ts` | 変更の概要 | [abc1234](https://github.com/ken512/mokucafe/commit/abc1234) |

## エビデンス
（動作確認内容、テスト結果など）

---

## Step5. マージ〜後処理

- Squash mergeで実行すること
- マージ後にブランチを削除すること
- ローカルのdevelopを最新に更新すること

!`git checkout develop`
!`git pull origin develop`