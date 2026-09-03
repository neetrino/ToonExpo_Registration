import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma';
import {
  createIdleDisconnect,
  DATABASE_IDLE_DISCONNECT_MS,
  shouldTrackDatabaseIdle,
} from '@/lib/db/idle-disconnect';
import { getEnv } from '@/lib/env';
import { logDatabaseDisconnected } from '@/lib/logger';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const idleDisconnect = createIdleDisconnect({
  idleMs: DATABASE_IDLE_DISCONNECT_MS,
  isEnabled: shouldTrackDatabaseIdle,
  disconnect: disconnectPrismaForIdle,
});

/**
 * Lazy Prisma singleton using Neon pooled DATABASE_URL via @prisma/adapter-neon.
 * Local/long-lived Node releases the client after 5 minutes idle.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const { DATABASE_URL } = getEnv();
    const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  idleDisconnect.ping();
  return globalForPrisma.prisma;
}

async function disconnectPrismaForIdle(): Promise<void> {
  const client = globalForPrisma.prisma;
  if (!client) {
    return;
  }

  globalForPrisma.prisma = undefined;
  idleDisconnect.clear();

  try {
    await client.$disconnect();
  } finally {
    logDatabaseDisconnected();
  }
}
