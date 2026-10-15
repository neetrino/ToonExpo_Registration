import type { Prisma } from '@/generated/prisma';
import { getPrisma } from '@/lib/db';
import { evaluateTicketResend } from '@/lib/admin/resend-ticket-guards';
import {
  DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';
import { processDueDeliveryJobs } from '@/lib/delivery/process-delivery-jobs';
import { getDexatelSmsConfig } from '@/lib/integrations/dexatel/config';

export type ResendTicketResult =
  { ok: true; emailQueued: boolean; smsQueued: boolean } | { ok: false; error: string };

type TicketChannel = 'EMAIL' | 'SMS';

const TEMPLATE_VERSION_BY_CHANNEL: Record<TicketChannel, string> = {
  EMAIL: TICKET_EMAIL_TEMPLATE_VERSION,
  SMS: TICKET_SMS_TEMPLATE_VERSION,
};

async function requeueTicketJob(
  tx: Prisma.TransactionClient,
  input: { registrationId: string; channel: TicketChannel; existingJobId?: string; now: Date },
): Promise<void> {
  if (input.existingJobId) {
    await tx.deliveryJob.update({
      where: { id: input.existingJobId },
      data: {
        status: 'PENDING',
        nextAttemptAt: input.now,
        attemptCount: 0,
        claimedAt: null,
        lastErrorCode: null,
      },
    });
    return;
  }

  await tx.deliveryJob.create({
    data: {
      registrationId: input.registrationId,
      channel: input.channel,
      templateVersion: TEMPLATE_VERSION_BY_CHANNEL[input.channel],
      status: 'PENDING',
      nextAttemptAt: input.now,
    },
  });
}

/**
 * Admin manual resend of the existing ticket (same QR, same hosted link).
 * Always re-queues email. Also re-queues SMS when Dexatel is configured,
 * even while automatic ticket SMS for public registrations is paused.
 */
export async function resendRegistrationTicket(
  registrationId: string,
): Promise<ResendTicketResult> {
  const prisma = getPrisma();
  const now = new Date();

  const event = await prisma.event.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  const registration = event
    ? await prisma.registration.findFirst({
        where: { id: registrationId, eventId: event.id },
        select: {
          id: true,
          ticketCode: true,
          ticketViewToken: true,
          emailLastAttemptAt: true,
          deliveryJobs: {
            where: {
              channel: { in: ['EMAIL', 'SMS'] },
              templateVersion: { in: [TICKET_EMAIL_TEMPLATE_VERSION, TICKET_SMS_TEMPLATE_VERSION] },
            },
            select: { id: true, channel: true, status: true, templateVersion: true },
          },
        },
      })
    : null;

  const guard = evaluateTicketResend({ hasActiveEvent: Boolean(event), registration, now });
  if (!guard.ok) {
    return guard;
  }

  if (!registration) {
    return { ok: false, error: 'Registration not found.' };
  }

  const smsQueued = getDexatelSmsConfig().ok;
  const jobIdFor = (channel: TicketChannel): string | undefined =>
    registration.deliveryJobs.find((job) => job.channel === channel)?.id;

  await prisma.$transaction(async (tx) => {
    await requeueTicketJob(tx, {
      registrationId: registration.id,
      channel: 'EMAIL',
      existingJobId: jobIdFor('EMAIL'),
      now,
    });

    if (smsQueued) {
      await requeueTicketJob(tx, {
        registrationId: registration.id,
        channel: 'SMS',
        existingJobId: jobIdFor('SMS'),
        now,
      });
    }

    await tx.registration.update({
      where: { id: registration.id },
      data: { emailDeliveryStatus: 'PENDING', emailLastAttemptAt: now },
    });
  });

  await processDueDeliveryJobs({
    registrationId: registration.id,
    limit: DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
    includeSms: smsQueued,
  });

  return { ok: true, emailQueued: true, smsQueued };
}
