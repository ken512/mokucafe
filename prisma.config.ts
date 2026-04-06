import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Next.jsの環境変数ファイルを読み込む
dotenv.config({ path: ".env.local" });

export default defineConfig({
  datasource: {
    // マイグレーション時はPgBouncer非対応のため直接接続URLを使用
    url: process.env.DIRECT_URL!,
  },
});
