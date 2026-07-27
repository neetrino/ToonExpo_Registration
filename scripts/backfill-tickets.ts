import 'dotenv/config';
import { getPrisma } from '../src/lib/db/prisma';
import { generateTicketCode, generateTicketViewToken } from '../src/lib/tickets/codes';

const BATCH_SIZE = 100;
const CODE_RETRIES = 8;

/**
 * Backfill legacy registrations with TOON_EXPO source, ticket codes, tokens, and feed events.
 * Does not create EMAIL jobs (avoids re-sending confirmation mail).
 *
 * Usage: pnpm tickets:backfill
 */
async function main(): Promise<void> {
  const prisma = getPrisma();
  let processed = 0;
  let feedCreated = 0;

  for (;;) {
    const batch = await prisma.registration.findMany({
      where: {
        OR: [{ ticketCode: null }, { sourceSystem: null }, { ticketViewToken: null }],
      },
      orderBy: { createdAt: 'asc' },
      take: BATCH_SIZE,
      select: {
        id: true,
        ticketCode: true,
        ticketViewToken: true,
        sourceSystem: true,
        attendanceStatus: true,
        partnerFeedEvents: { select: { id: true }, take: 1 },
      },
    });

    if (batch.length === 0) {
      break;
    }

    for (const row of batch) {
      const ticketCode = row.ticketCode ?? (await allocateTicketCode());
      const ticketViewToken = row.ticketViewToken ?? generateTicketViewToken();
      const sourceSystem = row.sourceSystem ?? 'TOON_EXPO';
      const attendanceStatus = row.attendanceStatus ?? 'NOT_VISITED';

      await prisma.$transaction(async (tx) => {
        await tx.registration.update({
          where: { id: row.id },
          data: {
            ticketCode,
            ticketViewToken,
            sourceSystem,
            attendanceStatus,
          },
        });

        if (sourceSystem === 'TOON_EXPO' && row.partnerFeedEvents.length === 0) {
          await tx.partnerFeedEvent.create({
            data: {
              registrationId: row.id,
              type: 'UPSERT',
            },
          });
          feedCreated += 1;
        }
      });

      processed += 1;
    }

    console.info(`Backfilled batch: +${batch.length} (total ${processed})`);
  }

  console.info(`Done. Updated ${processed} registration(s); created ${feedCreated} feed event(s).`);
}

async function allocateTicketCode(): Promise<string> {
  const prisma = getPrisma();

  for (let attempt = 0; attempt < CODE_RETRIES; attempt += 1) {
    const ticketCode = generateTicketCode();
    const existing = await prisma.registration.findFirst({
      where: { ticketCode },
      select: { id: true },
    });
    if (!existing) {
      return ticketCode;
    }
  }

  throw new Error('Unable to allocate a unique ticket code after retries');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
