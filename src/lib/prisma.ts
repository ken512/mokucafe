import { PrismaClient } from "@prisma/client";

// 開発環境でホットリロード時に複数インスタンスが生成されるのを防ぐ
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // アプリ実行時はPgBouncer経由のプーリングURLを使用
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
