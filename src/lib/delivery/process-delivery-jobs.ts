import { getPrisma } from '@/lib/db/prisma';
import {
  DELIVERY_BACKOFF_SECONDS,
  DELIVERY_CLAIM_BATCH_SIZE,
  DELIVERY_MAX_ATTEMPTS,
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';
import { sendTicketEmail } from '@/lib/delivery/send-ticket-email';
import { sendTicketSms } from '@/lib/delivery/send-ticket-sms';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';

export type ProcessDeliveryResult = {
  claimed: number;
  sent: number;
  failed: number;
  retried: number;
};

/**
 * Process due EMAIL and SMS delivery jobs, optionally limited to one registration.
 */
export async function processDueDeliveryJobs(options?: {
  registrationId?: string;
  limit?: number;
}): Promise<ProcessDeliveryResult> {
  const prisma = getPrisma();
  const limit = options?.limit ?? DELIVERY_CLAIM_BATCH_SIZE;
  const now = new Date();

  const candidates = await prisma.deliveryJob.findMany({
    where: {
      status: 'PENDING',
      nextAttemptAt: { lte: now },
      channel: { in: ['EMAIL', 'SMS'] },
      ...(options?.registrationId ? { registrationId: options.registrationId } : {}),
    },
    orderBy: { nextAttemptAt: 'asc' },
    take: limit,
    select: { id: true, channel: true },
  });

  const result: ProcessDeliveryResult = { claimed: 0, sent: 0, failed: 0, retried: 0 };

  for (const candidate of candidates) {
    const claimed = await prisma.deliveryJob.updateMany({
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
    if (candidate.channel === 'EMAIL') {
      await processClaimedEmailJob(candidate.id, result);
    } else {
      await processClaimedSmsJob(candidate.id, result);
    }
  }

  return result;
}

async function processClaimedEmailJob(jobId: string, result: ProcessDeliveryResult): Promise<void> {
  const prisma = getPrisma();

  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      registrationId: true,
      attemptCount: true,
      templateVersion: true,
      registration: {
        select: {
          id: true,
          email: true,
          firstName: true,
          locale: true,
          ticketCode: true,
          ticketViewToken: true,
        },
      },
    },
  });

  if (!job || job.templateVersion !== TICKET_EMAIL_TEMPLATE_VERSION) {
    await markJobFailed(jobId, 'unsupported_template', false, job?.attemptCount ?? 1, result);
    return;
  }

  const registration = job.registration;
  if (!registration.ticketCode || !registration.ticketViewToken) {
    await markJobFailed(jobId, 'missing_ticket', false, job.attemptCount, result);
    return;
  }

  const sendResult = await sendTicketEmail({
    registrationId: registration.id,
    email: registration.email,
    firstName: registration.firstName,
    locale: registration.locale,
    ticketCode: registration.ticketCode,
    ticketViewToken: registration.ticketViewToken,
  });

  const attemptedAt = new Date();

  if (sendResult.ok) {
    try {
      await prisma.$transaction([
        prisma.deliveryJob.update({
          where: { id: jobId },
          data: {
            status: 'SENT',
            providerMessageId: sendResult.messageId ?? null,
            lastErrorCode: null,
            sentAt: attemptedAt,
          },
        }),
        prisma.registration.update({
          where: { id: registration.id },
          data: {
            emailDeliveryStatus: 'SENT',
            emailLastAttemptAt: attemptedAt,
            emailProviderMessageId: sendResult.messageId ?? null,
          },
        }),
      ]);
      result.sent += 1;
    } catch (error: unknown) {
      logger.error('Failed to persist SENT email delivery state', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  await markJobFailed(jobId, sendResult.reason, sendResult.retryable, job.attemptCount, result, {
    registrationId: registration.id,
    channel: 'EMAIL',
  });
}

async function processClaimedSmsJob(jobId: string, result: ProcessDeliveryResult): Promise<void> {
  const prisma = getPrisma();

  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      registrationId: true,
      attemptCount: true,
      templateVersion: true,
      registration: {
        select: {
          id: true,
          phoneNormalized: true,
          locale: true,
          ticketViewToken: true,
        },
      },
    },
  });

  if (!job || job.templateVersion !== TICKET_SMS_TEMPLATE_VERSION) {
    await markJobFailed(jobId, 'unsupported_template', false, job?.attemptCount ?? 1, result);
    return;
  }

  const registration = job.registration;
  if (!registration.ticketViewToken) {
    await markJobFailed(jobId, 'missing_ticket', false, job.attemptCount, result);
    return;
  }

  const sendResult = await sendTicketSms({
    registrationId: registration.id,
    phoneNormalized: registration.phoneNormalized,
    locale: registration.locale,
    ticketViewToken: registration.ticketViewToken,
  });

  const attemptedAt = new Date();

  if (sendResult.ok) {
    try {
      await prisma.deliveryJob.update({
        where: { id: jobId },
        data: {
          status: 'SENT',
          providerMessageId: sendResult.messageId ?? null,
          lastErrorCode: null,
          sentAt: attemptedAt,
        },
      });
      result.sent += 1;
    } catch (error: unknown) {
      logger.error('Failed to persist SENT SMS delivery state', {
        code: mapRegistrationError(error).code,
      });
    }
    return;
  }

  await markJobFailed(jobId, sendResult.reason, sendResult.retryable, job.attemptCount, result, {
    registrationId: registration.id,
    channel: 'SMS',
  });
}

async function markJobFailed(
  jobId: string,
  errorCode: string,
  retryable: boolean,
  attemptCount: number,
  result: ProcessDeliveryResult,
  mirror?: { registrationId: string; channel: 'EMAIL' | 'SMS' },
): Promise<void> {
  const prisma = getPrisma();
  const attemptedAt = new Date();
  const canRetry = retryable && attemptCount < DELIVERY_MAX_ATTEMPTS;
  const backoffIndex = Math.min(attemptCount - 1, DELIVERY_BACKOFF_SECONDS.length - 1);
  const delaySeconds = DELIVERY_BACKOFF_SECONDS[backoffIndex] ?? 3600;

  try {
    if (canRetry) {
      await prisma.deliveryJob.update({
        where: { id: jobId },
        data: {
          status: 'PENDING',
          lastErrorCode: errorCode,
          nextAttemptAt: new Date(attemptedAt.getTime() + delaySeconds * 1000),
          claimedAt: null,
        },
      });
      if (mirror?.channel === 'EMAIL') {
        await prisma.registration.update({
          where: { id: mirror.registrationId },
          data: {
            emailDeliveryStatus: 'PENDING',
            emailLastAttemptAt: attemptedAt,
          },
        });
      }
      result.retried += 1;
      return;
    }

    await prisma.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        lastErrorCode: errorCode,
        claimedAt: null,
      },
    });
    if (mirror?.channel === 'EMAIL') {
      await prisma.registration.update({
        where: { id: mirror.registrationId },
        data: {
          emailDeliveryStatus: 'FAILED',
          emailLastAttemptAt: attemptedAt,
        },
      });
    }
    result.failed += 1;
  } catch (error: unknown) {
    logger.error('Failed to persist delivery failure state', {
      code: mapRegistrationError(error).code,
    });
  }
}
