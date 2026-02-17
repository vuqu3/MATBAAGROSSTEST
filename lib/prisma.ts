import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Uygulama her zaman SQLite (dev.db) kullanır; PostgreSQL adresi verilse bile file: kullanılır
const envUrl = process.env.DATABASE_URL;
const url =
  typeof envUrl === 'string' && envUrl.trim().startsWith('file:')
    ? envUrl.trim()
    : 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
