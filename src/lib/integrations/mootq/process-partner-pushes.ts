import { getPrisma } from '@/lib/db/prisma';
import { getMootqPushConfig } from '@/lib/integrations/mootq/push-config';
import { pushRegistrationToMootq } from '@/lib/integrations/mootq/push-client';
import {
  MOOTQ_PUSH_CLAIM_BATCH_SIZE,
  MOOTQ_PUSH_MIN_INTERVAL_MS,
} from '@/lib/integrations/mootq/push-constants';
import { resolvePartnerPushRetryDecision } from '@/lib/integrations/mootq/push-outcome';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';

export type ProcessPartnerPushResult = {
  claimed: number;
  sent: number;
  failed: number;
  retried: number;
  skippedNotConfigured: boolean;
};

/**
 * Claim and send due PartnerPushDelivery rows (optional single registration).
 * When MOOTQ_PUSH_* is unset, leaves rows PENDING and returns without claiming.
 */
export async function processDuePartnerPushes(options?: {
  registrationId?: string;
  limit?: number;
}): Promise<ProcessPartnerPushResult> {
  const config = getMootqPushConfig();
  if (!config.ok) {
    logger.info('Partner push processing skipped (NOT_CONFIGURED)');
    return {
      claimed: 0,
      sent: 0,
      failed: 0,
      retried: 0,
      skippedNotConfigured: true,
    };
  }

  const prisma = getPrisma();
  const limit = options?.limit ?? MOOTQ_PUSH_CLAIM_BATCH_SIZE;
  const now = new Date();

  const candidates = await prisma.partnerPushDelivery.findMany({
    where: {
      status: 'PENDING',
      nextAttemptAt: { lte: now },
      ...(options?.registrationId ? { registrationId: options.registrationId } : {}),
    },
    orderBy: { nextAttemptAt: 'asc' },
    take: limit,
    select: { id: true },
  });

  const result: ProcessPartnerPushResult = {
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

    const claimed = await prisma.partnerPushDelivery.updateMany({
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
    await processClaimedPartnerPush(candidate.id, result);

    if (index < candidates.length - 1) {
      await delay(MOOTQ_PUSH_MIN_INTERVAL_MS);
    }
  }

  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function processClaimedPartnerPush(
  deliveryId: string,
  result: ProcessPartnerPushResult,
): Promise<void> {
  const prisma = getPrisma();

  const delivery = await prisma.partnerPushDelivery.findUnique({
    where: { id: deliveryId },
    select: {
      id: true,
      registrationId: true,
      attemptCount: true,
      registration: {
        select: {
          id: true,
          ticketCode: true,
          createdAt: true,
          sourceSystem: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          locale: true,
          answers: true,
          formVersion: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
        },
      },
    },
  });

  if (!delivery) {
    return;
  }

  const { registration } = delivery;
  if (registration.sourceSystem !== 'TOON_EXPO' || !registration.ticketCode) {
    await markPartnerPushFailed(
      deliveryId,
      registration.ticketCode ? 'unsupported_source' : 'missing_ticket',
      false,
      delivery.attemptCount,
      result,
    );
    return;
  }

  const pushResult = await pushRegistrationToMootq({
    registrationId: registration.id,
    ticketCode: registration.ticketCode,
    registeredAt: registration.createdAt,
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    locale: registration.locale,
    answers: registration.answers,
    formVersion: registration.formVersion,
    utmSource: registration.utmSource,
    utmMedium: registration.utmMedium,
    utmCampaign: registration.utmCampaign,
  });

  const attemptedAt = new Date();

  if (pushResult.ok) {
    try {
      await prisma.partnerPushDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'SENT',
          lastErrorCode: null,
          sentAt: attemptedAt,
        },
      });
      result.sent += 1;
    } catch (error: unknown) {
      logger.error('Failed to persist SENT partner push state', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  // NOT_CONFIGURED mid-flight: put back PENDING without burning attempts permanently.
  if (pushResult.reason === 'NOT_CONFIGURED') {
    try {
      await prisma.partnerPushDelivery.update({
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
      logger.error('Failed to restore partner push after NOT_CONFIGURED', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  await markPartnerPushFailed(
    deliveryId,
    pushResult.reason,
    pushResult.retryable,
    delivery.attemptCount,
    result,
  );
}

async function markPartnerPushFailed(
  deliveryId: string,
  errorCode: string,
  retryable: boolean,
  attemptCount: number,
  result: ProcessPartnerPushResult,
): Promise<void> {
  const prisma = getPrisma();
  const attemptedAt = new Date();
  const decision = resolvePartnerPushRetryDecision({ retryable, attemptCount });

  try {
    if (decision.action === 'retry') {
      await prisma.partnerPushDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'PENDING',
          lastErrorCode: errorCode,
          nextAttemptAt: new Date(attemptedAt.getTime() + decision.delaySeconds * 1000),
          claimedAt: null,
        },
      });
      result.retried += 1;
      return;
    }

    await prisma.partnerPushDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'FAILED',
        lastErrorCode: errorCode,
        claimedAt: null,
      },
    });
    result.failed += 1;
  } catch (error: unknown) {
    logger.error('Failed to persist partner push failure state', {
      code: mapRegistrationError(error).code,
    });
  }
}
