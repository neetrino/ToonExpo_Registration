import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma';
import { getEnv } from '@/lib/env';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

/**
 * Lazy Prisma singleton using Neon pooled DATABASE_URL via @prisma/adapter-neon.
 * The client stays open for the life of the process.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const { DATABASE_URL } = getEnv();
    const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
