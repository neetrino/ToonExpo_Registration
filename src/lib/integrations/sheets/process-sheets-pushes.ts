import { getPrisma } from '@/lib/db/prisma';
import { appendSheetRow } from '@/lib/integrations/sheets/client';
import { getSheetsWebhookConfig } from '@/lib/integrations/sheets/config';
import {
  SHEETS_PUSH_CLAIM_BATCH_SIZE,
  SHEETS_PUSH_MIN_INTERVAL_MS,
} from '@/lib/integrations/sheets/constants';
import { toSheetsRow } from '@/lib/integrations/sheets/map-row';
import { resolveSheetsPushRetryDecision } from '@/lib/integrations/sheets/outcome';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';

export type ProcessSheetsPushResult = {
  claimed: number;
  sent: number;
  failed: number;
  retried: number;
  skippedNotConfigured: boolean;
};

/**
 * Claim and append due SheetsPushDelivery rows (optional single registration).
 * When SHEETS_WEBHOOK_* is unset, leaves rows PENDING and returns without claiming.
 */
export async function processDueSheetsPushes(options?: {
  registrationId?: string;
  limit?: number;
}): Promise<ProcessSheetsPushResult> {
  const config = getSheetsWebhookConfig();
  if (!config.ok) {
    logger.info('Sheets push processing skipped (NOT_CONFIGURED)');
    return {
      claimed: 0,
      sent: 0,
      failed: 0,
      retried: 0,
      skippedNotConfigured: true,
    };
  }

  const prisma = getPrisma();
  const limit = options?.limit ?? SHEETS_PUSH_CLAIM_BATCH_SIZE;
  const now = new Date();

  const candidates = await prisma.sheetsPushDelivery.findMany({
    where: {
      status: 'PENDING',
      nextAttemptAt: { lte: now },
      ...(options?.registrationId ? { registrationId: options.registrationId } : {}),
    },
    orderBy: { nextAttemptAt: 'asc' },
    take: limit,
    select: { id: true },
  });

  const result: ProcessSheetsPushResult = {
    claimed: 0,
    sent: 0,
    failed: 0,
    retried: 0,
    skippedNotConfigured: false,
  };

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!candidate) {
      continue;
    }

    const claimed = await prisma.sheetsPushDelivery.updateMany({
      where: { id: candidate.id, status: 'PENDING' },
      data: {
        status: 'PROCESSING',
        claimedAt: now,
        attemptCount: { increment: 1 },
      },
    });

    if (claimed.count !== 1) {
      continue;
    }

    result.claimed += 1;
    await processClaimedSheetsPush(candidate.id, result);

    if (index < candidates.length - 1) {
      await delay(SHEETS_PUSH_MIN_INTERVAL_MS);
    }
  }

  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function processClaimedSheetsPush(
  deliveryId: string,
  result: ProcessSheetsPushResult,
): Promise<void> {
  const prisma = getPrisma();

  const delivery = await prisma.sheetsPushDelivery.findUnique({
    where: { id: deliveryId },
    select: {
      id: true,
      registrationId: true,
      attemptCount: true,
      registration: {
        select: {
          id: true,
          createdAt: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          locale: true,
          sourceSystem: true,
          sourceRegistrationId: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          ticketCode: true,
          attendanceStatus: true,
          emailDeliveryStatus: true,
          formVersion: true,
          formChannel: true,
          answers: true,
        },
      },
    },
  });

  if (!delivery) {
    return;
  }

  const { registration } = delivery;
  if (registration.sourceSystem !== 'TOON_EXPO') {
    await markSheetsPushFailed(
      deliveryId,
      'unsupported_source',
      false,
      delivery.attemptCount,
      result,
    );
    return;
  }

  let appendResult: Awaited<ReturnType<typeof appendSheetRow>>;
  try {
    appendResult = await appendSheetRow(toSheetsRow(registration));
  } catch (error: unknown) {
    appendResult = {
      ok: false,
      reason: error instanceof Error ? error.message.slice(0, 64) : 'SHEETS_UNKNOWN',
      retryable: true,
    };
  }

  const attemptedAt = new Date();

  if (appendResult.ok) {
    try {
      await prisma.sheetsPushDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'SENT',
          lastErrorCode: null,
          sentAt: attemptedAt,
        },
      });
      result.sent += 1;
    } catch (error: unknown) {
      logger.error('Failed to persist SENT sheets push state', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  if (appendResult.reason === 'NOT_CONFIGURED') {
    try {
      await prisma.sheetsPushDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'PENDING',
          lastErrorCode: 'NOT_CONFIGURED',
          nextAttemptAt: attemptedAt,
          claimedAt: null,
          attemptCount: { decrement: 1 },
        },
      });
      result.retried += 1;
    } catch (error: unknown) {
      logger.error('Failed to restore sheets push after NOT_CONFIGURED', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  await markSheetsPushFailed(
    deliveryId,
    appendResult.reason,
    appendResult.retryable,
    delivery.attemptCount,
    result,
  );
}

async function markSheetsPushFailed(
  deliveryId: string,
  errorCode: string,
  retryable: boolean,
  attemptCount: number,
  result: ProcessSheetsPushResult,
): Promise<void> {
  const prisma = getPrisma();
  const attemptedAt = new Date();
  const decision = resolveSheetsPushRetryDecision({ retryable, attemptCount });

  try {
    if (decision.action === 'retry') {
      await prisma.sheetsPushDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'PENDING',
          lastErrorCode: errorCode.slice(0, 64),
          nextAttemptAt: new Date(attemptedAt.getTime() + decision.delaySeconds * 1000),
          claimedAt: null,
        },
      });
      result.retried += 1;
      return;
    }

    await prisma.sheetsPushDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'FAILED',
        lastErrorCode: errorCode.slice(0, 64),
        claimedAt: null,
      },
    });
    result.failed += 1;
  } catch (error: unknown) {
    logger.error('Failed to persist sheets push failure state', {
      code: mapRegistrationError(error).code,
    });
  }
}
