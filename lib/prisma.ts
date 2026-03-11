import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPool() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is required');
  const url = new URL(raw);
  return new Pool({
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 5432,
    database: url.pathname.replace(/^\//, ''),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  });
}

const pool = createPool();
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  // In dev, the global PrismaClient instance can survive hot reloads.
  // If the Prisma Client was regenerated (schema change), the cached instance
  // may not include new model delegates. Recreate it once if we detect that.
  const cached = globalForPrisma.prisma;
  if (cached && !(cached as any).referenceProduct) {
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } else {
    globalForPrisma.prisma = prisma;
  }
}
