import {
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';
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
 * Persist EMAIL delivery job and, when Dexatel is configured, SMS delivery job.
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

  if (!getDexatelSmsConfig().ok) {
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
