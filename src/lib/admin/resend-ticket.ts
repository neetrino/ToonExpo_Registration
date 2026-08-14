import { getPrisma } from '@/lib/db';
import { evaluateTicketResend } from '@/lib/admin/resend-ticket-guards';
import {
  DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';
import { createTicketDeliveryJobs } from '@/lib/delivery/create-ticket-delivery-jobs';
import { processDueDeliveryJobs } from '@/lib/delivery/process-delivery-jobs';
import { getDexatelSmsConfig } from '@/lib/integrations/dexatel/config';

export type ResendTicketResult =
  | { ok: true; emailQueued: boolean; smsQueued: boolean }
  | { ok: false; error: string };

/**
 * Re-queue the existing ticket email/SMS for one registration (same QR, same hosted link).
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

  const guard = evaluateTicketResend({
    hasActiveEvent: Boolean(event),
    registration,
    now,
  });

  if (!guard.ok) {
    return guard;
  }

  if (!registration) {
    return { ok: false, error: 'Registration not found.' };
  }

  const smsEnabled = getDexatelSmsConfig().ok;
  const emailJob = registration.deliveryJobs.find((job) => job.channel === 'EMAIL');
  const smsJob = registration.deliveryJobs.find((job) => job.channel === 'SMS');

  await prisma.$transaction(async (tx) => {
    const resetData = {
      status: 'PENDING' as const,
      nextAttemptAt: now,
      attemptCount: 0,
      claimedAt: null,
      lastErrorCode: null,
    };

    if (!emailJob && !smsJob) {
      await createTicketDeliveryJobs(tx, registration.id);
    } else {
      if (emailJob) {
        await tx.deliveryJob.update({ where: { id: emailJob.id }, data: resetData });
      } else {
        await tx.deliveryJob.create({
          data: {
            registrationId: registration.id,
            channel: 'EMAIL',
            templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
            status: 'PENDING',
            nextAttemptAt: now,
          },
        });
      }

      if (smsEnabled) {
        if (smsJob) {
          await tx.deliveryJob.update({ where: { id: smsJob.id }, data: resetData });
        } else {
          await tx.deliveryJob.create({
            data: {
              registrationId: registration.id,
              channel: 'SMS',
              templateVersion: TICKET_SMS_TEMPLATE_VERSION,
              status: 'PENDING',
              nextAttemptAt: now,
            },
          });
        }
      }
    }

    await tx.registration.update({
      where: { id: registration.id },
      data: {
        emailDeliveryStatus: 'PENDING',
        emailLastAttemptAt: now,
      },
    });
  });

  await processDueDeliveryJobs({
    registrationId: registration.id,
    limit: DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
  });

  return { ok: true, emailQueued: true, smsQueued: smsEnabled };
}
