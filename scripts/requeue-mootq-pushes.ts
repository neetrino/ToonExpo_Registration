import 'dotenv/config';
import { getPrisma } from '../src/lib/db/prisma';

/** Mootq allows 60 requests/min; each registration costs 2 (schema GET + POST). */
const DEFAULT_PER_MINUTE = 20;
const MAX_PER_MINUTE = 25;
const MINUTE_MS = 60_000;

type Options = { apply: boolean; limit: number | null; perMinute: number };

/**
 * Re-deliver every Toon Expo registration that never reached Mootq.
 * FAILED partner pushes go back to PENDING with a fresh attempt budget; registrations
 * without a push row get one. `nextAttemptAt` is spread at `perMinute` rows per minute so
 * the minute cron stays under the Mootq rate limit and live registrations are not delayed.
 *
 * Usage: pnpm exec tsx scripts/requeue-mootq-pushes.ts [--apply] [--limit=50] [--per-minute=20]
 * Without --apply only counts are printed.
 */
function parseOptions(argv: readonly string[]): Options {
  const value = (name: string): string | undefined =>
    argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
  const limit = value('limit') ? Number(value('limit')) : null;
  const perMinute = value('per-minute') ? Number(value('per-minute')) : DEFAULT_PER_MINUTE;

  if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error('--limit must be a positive integer');
  }
  if (!Number.isInteger(perMinute) || perMinute < 1 || perMinute > MAX_PER_MINUTE) {
    throw new Error(`--per-minute must be 1..${MAX_PER_MINUTE}`);
  }
  return { apply: argv.includes('--apply'), limit, perMinute };
}

async function createMissingDeliveries(apply: boolean): Promise<number> {
  const prisma = getPrisma();
  const missing = await prisma.registration.findMany({
    where: { sourceSystem: 'TOON_EXPO', ticketCode: { not: null }, partnerPushDelivery: { is: null } },
    select: { id: true },
  });
  if (!apply || missing.length === 0) {
    return missing.length;
  }
  const created = await prisma.partnerPushDelivery.createMany({
    data: missing.map((row) => ({ registrationId: row.id, status: 'FAILED', lastErrorCode: 'never_queued' })),
    skipDuplicates: true,
  });
  return created.count;
}

async function selectFailed(limit: number | null): Promise<string[]> {
  const rows = await getPrisma().partnerPushDelivery.findMany({
    where: { status: 'FAILED', registration: { sourceSystem: 'TOON_EXPO' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
    ...(limit === null ? {} : { take: limit }),
  });
  return rows.map((row) => row.id);
}

async function requeue(ids: readonly string[], perMinute: number): Promise<number> {
  const prisma = getPrisma();
  const start = Date.now() + MINUTE_MS;
  let requeued = 0;

  for (let offset = 0; offset < ids.length; offset += perMinute) {
    const chunk = ids.slice(offset, offset + perMinute);
    const updated = await prisma.partnerPushDelivery.updateMany({
      where: { id: { in: chunk }, status: 'FAILED' },
      data: {
        status: 'PENDING',
        attemptCount: 0,
        lastErrorCode: null,
        claimedAt: null,
        nextAttemptAt: new Date(start + (offset / perMinute) * MINUTE_MS),
      },
    });
    requeued += updated.count;
  }
  return requeued;
}

async function summarize(): Promise<void> {
  const groups = await getPrisma().partnerPushDelivery.groupBy({
    by: ['status', 'lastErrorCode'],
    _count: { _all: true },
  });
  const summary = groups.map((group) => `${group.status}:${group.lastErrorCode ?? '-'}=${group._count._all}`);
  process.stdout.write(`${JSON.stringify({ summary })}\n`);
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const missing = await createMissingDeliveries(options.apply);
  const ids = await selectFailed(options.limit);
  const minutes = Math.ceil(ids.length / options.perMinute);
  process.stdout.write(`${JSON.stringify({ apply: options.apply, missing, selected: ids.length, minutes })}\n`);

  if (options.apply) {
    const requeued = await requeue(ids, options.perMinute);
    process.stdout.write(`${JSON.stringify({ requeued })}\n`);
  }
  await summarize();
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'requeue failed'}\n`);
    process.exitCode = 1;
  })
  .finally(() => getPrisma().$disconnect());
