import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * 判断是否为 Turso / libSQL 连接串。
 */
function isLibsqlUrl(url: string): boolean {
  return url.startsWith('libsql:');
}

/**
 * 创建 Prisma Client：本地 file: 用 better-sqlite3，生产 libsql: 用 Turso 适配器。
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (isLibsqlUrl(url)) {
    const adapter = new PrismaLibSql({ url });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

/**
 * 判断缓存的 Prisma 单例是否已过期（schema 变更后热重载未重建）。
 */
function isStalePrismaClient(client: PrismaClient | undefined): boolean {
  if (!client) return false;
  return typeof (client as PrismaClient & { pipelineRun?: unknown }).pipelineRun === 'undefined';
}

/**
 * 获取 Prisma 单例；若缓存缺少新模型则自动重建。
 */
function getPrismaClient(): PrismaClient {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  if (isStalePrismaClient(globalForPrisma.prisma)) {
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const db = getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
  globalForPrisma.prisma = db;
}
