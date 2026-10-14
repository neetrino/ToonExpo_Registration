import 'dotenv/config';
import { getPrisma } from '../src/lib/db/prisma';

const prisma = getPrisma();
const deployedAt = new Date('2026-10-14T11:25:00Z');

async function main(): Promise<void> {
  const [total, oldSent, newSent, pending] = await Promise.all([
    prisma.partnerPushDelivery.count({ where: { status: 'SENT' } }),
    prisma.partnerPushDelivery.count({ where: { status: 'SENT', registration: { createdAt: { lt: deployedAt } } } }),
    prisma.partnerPushDelivery.count({ where: { status: 'SENT', registration: { createdAt: { gte: deployedAt } } } }),
    prisma.partnerPushDelivery.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
  ]);
  const backfilled = await prisma.partnerPushDelivery.count({
    where: {
      status: 'SENT',
      sentAt: { gte: new Date('2026-10-14T12:20:00Z') },
      registration: { createdAt: { lt: deployedAt } },
    },
  });
  process.stdout.write(
    `${JSON.stringify({ at: new Date().toISOString(), total, oldSent, newSent, backfilled, pending })}\n`,
  );
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
