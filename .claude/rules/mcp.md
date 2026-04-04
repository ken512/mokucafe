# MCPサーバールール

## Supabase MCP

接続設定は `~/.claude/settings.json` に記載（Git管理外）。

### 許可する操作
- テーブル構造・スキーマの参照
- レコードの読み取り（SELECT）
- マイグレーション前後のデータ確認

### 禁止する操作
- 本番データの直接更新・削除（UPDATE / DELETE / DROP）
- スキーマの直接変更（必ず `npm run prisma:push:dev` 経由で行う）
- 本アプリ以外のプロジェクトへのアクセス

## Context7 MCP

接続設定は `~/.claude/settings.json` に記載（Git管理外）。

### 使うタイミング
- Next.js / Prisma / Supabase / react-hook-form の実装時
- バージョンアップ後の変更点が不明なとき

### 使わないタイミング
- プロジェクト固有の実装（ドキュメントに存在しない）
- 単純な TypeScript / JavaScript の質問