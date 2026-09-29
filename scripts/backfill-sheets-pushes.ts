import 'dotenv/config';
import { getPrisma } from '../src/lib/db/prisma';
import { getSheetsWebhookConfig } from '../src/lib/integrations/sheets/config';
import { processDueSheetsPushes } from '../src/lib/integrations/sheets/process-sheets-pushes';

const BATCH_SIZE = 10;
const MAX_ROUNDS = 50;

/**
 * Enqueue TOON_EXPO registrations that have no Sheets row, then append them.
 * Already-sent deliveries are left untouched. MOOTQ rows are not selected.
 *
 * Usage: pnpm exec tsx scripts/backfill-sheets-pushes.ts
 */
async function enqueueMissing(): Promise<number> {
  const prisma = getPrisma();
  const missing = await prisma.registration.findMany({
    where: { sourceSystem: 'TOON_EXPO', sheetsPushDelivery: { is: null } },
    select: { id: true },
  });

  if (missing.length === 0) {
    return 0;
  }

  const now = new Date();
  const created = await prisma.sheetsPushDelivery.createMany({
    data: missing.map((row) => ({
      registrationId: row.id,
      status: 'PENDING',
      nextAttemptAt: now,
    })),
    skipDuplicates: true,
  });

  return created.count;
}

async function summarize(): Promise<void> {
  const prisma = getPrisma();
  const [pushByStatus, missingPush] = await Promise.all([
    prisma.sheetsPushDelivery.groupBy({ by: ['status'], _count: true }),
    prisma.registration.count({
      where: { sourceSystem: 'TOON_EXPO', sheetsPushDelivery: { is: null } },
    }),
  ]);

  process.stdout.write(`${JSON.stringify({ pushByStatus, missingPush })}\n`);
}

async function waitForNextPending(): Promise<boolean> {
  const prisma = getPrisma();
  const waiting = await prisma.sheetsPushDelivery.findFirst({
    where: { status: 'PENDING' },
    orderBy: { nextAttemptAt: 'asc' },
    select: { nextAttemptAt: true, lastErrorCode: true },
  });

  if (!waiting) {
    return false;
  }

  const waitMs = Math.max(0, waiting.nextAttemptAt.getTime() - Date.now());
  process.stdout.write(
    `${JSON.stringify({ waiting: true, waitMs, lastErrorCode: waiting.lastErrorCode })}\n`,
  );
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(waitMs, 15_000) + 250);
  });
  return true;
}

async function main(): Promise<void> {
  const config = getSheetsWebhookConfig();
  if (!config.ok) {
    process.stderr.write(`${config.reason}\n`);
    process.exitCode = 1;
    return;
  }

  const enqueued = await enqueueMissing();
  process.stdout.write(`${JSON.stringify({ enqueued })}\n`);

  const totals = { claimed: 0, sent: 0, failed: 0, retried: 0 };

  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    const result = await processDueSheetsPushes({ limit: BATCH_SIZE });
    totals.claimed += result.claimed;
    totals.sent += result.sent;
    totals.failed += result.failed;
    totals.retried += result.retried;
    process.stdout.write(`${JSON.stringify({ round, result, totals })}\n`);

    if (result.skippedNotConfigured) {
      process.exitCode = 1;
      break;
    }

    if (result.claimed > 0 && result.sent === 0) {
      process.stderr.write('Stopped: first claimed batch wrote no rows\n');
      process.exitCode = 1;
      break;
    }

    if (result.claimed === 0) {
      const stillWaiting = await waitForNextPending();
      if (!stillWaiting) {
        break;
      }
    }
  }

  await summarize();
  await getPrisma().$disconnect();
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'backfill failed'}\n`);
  process.exit(1);
});
