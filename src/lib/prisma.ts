import { PrismaClient } from ".prisma/client/default";

// 開発環境でホットリロード時に複数インスタンスが生成されるのを防ぐ
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// リクエスト時に初めて評価されるようにgetterで遅延初期化する
const getPrismaClient = (): PrismaClient => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
