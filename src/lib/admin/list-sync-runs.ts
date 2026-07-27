import { getPrisma } from '@/lib/db/prisma';

export type AdminSyncRunRow = {
  id: string;
  direction: string;
  status: string;
  initiatedBy: string;
  lastCursor: string | null;
  readCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  conflictCount: number;
  errorCount: number;
  startedAt: Date;
  finishedAt: Date | null;
};

/**
 * Recent integration sync runs for admin visibility.
 */
export async function listAdminSyncRuns(limit = 20): Promise<AdminSyncRunRow[]> {
  const prisma = getPrisma();
  return prisma.integrationSyncRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      direction: true,
      status: true,
      initiatedBy: true,
      lastCursor: true,
      readCount: true,
      createdCount: true,
      updatedCount: true,
      skippedCount: true,
      conflictCount: true,
      errorCount: true,
      startedAt: true,
      finishedAt: true,
    },
  });
}
