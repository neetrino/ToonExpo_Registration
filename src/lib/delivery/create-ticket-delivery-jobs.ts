import {
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';
import { isTicketSmsDeliveryEnabled } from '@/lib/delivery/ticket-sms-policy';
import { getDexatelSmsConfig } from '@/lib/integrations/dexatel/config';

type DeliveryJobWriter = {
  deliveryJob: {
    create: (args: {
      data: {
        registrationId: string;
        channel: 'EMAIL' | 'SMS';
        templateVersion: string;
        status: 'PENDING';
        nextAttemptAt: Date;
      };
    }) => Promise<unknown>;
  };
};

/**
 * Persist the EMAIL delivery job.
 * SMS is queued only when ticket SMS is enabled and Dexatel is configured.
 */
export async function createTicketDeliveryJobs(
  tx: DeliveryJobWriter,
  registrationId: string,
): Promise<void> {
  const now = new Date();

  await tx.deliveryJob.create({
    data: {
      registrationId,
      channel: 'EMAIL',
      templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
      status: 'PENDING',
      nextAttemptAt: now,
    },
  });

  if (!isTicketSmsDeliveryEnabled() || !getDexatelSmsConfig().ok) {
    return;
  }

  await tx.deliveryJob.create({
    data: {
      registrationId,
      channel: 'SMS',
      templateVersion: TICKET_SMS_TEMPLATE_VERSION,
      status: 'PENDING',
      nextAttemptAt: now,
    },
  });
}
