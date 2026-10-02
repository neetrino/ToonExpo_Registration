import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';

const getPrisma = vi.hoisted(() => vi.fn());
const sendTicketEmail = vi.hoisted(() => vi.fn());
const sendTicketSms = vi.hoisted(() => vi.fn());
const isTicketSmsDeliveryEnabled = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db/prisma', () => ({ getPrisma }));
vi.mock('@/lib/delivery/send-ticket-email', () => ({ sendTicketEmail }));
vi.mock('@/lib/delivery/send-ticket-sms', () => ({ sendTicketSms }));
vi.mock('@/lib/delivery/ticket-sms-policy', () => ({ isTicketSmsDeliveryEnabled }));

import { processDueDeliveryJobs } from '@/lib/delivery/process-delivery-jobs';

const EMAIL_JOB_ID = 'job_email';
const SMS_JOB_ID = 'job_sms';
const REGISTRATION_ID = 'reg_1';

function createPrismaMock() {
  const findMany = vi.fn();
  const updateMany = vi.fn().mockResolvedValue({ count: 1 });
  const findUnique = vi.fn();
  const update = vi.fn().mockResolvedValue({});
  const registrationUpdate = vi.fn().mockResolvedValue({});

  getPrisma.mockReturnValue({
    deliveryJob: { findMany, updateMany, findUnique, update },
    registration: { update: registrationUpdate },
    $transaction: vi.fn(async (ops: Array<Promise<unknown>>) => Promise.all(ops)),
  });

  return { findMany, findUnique };
}

describe('processDueDeliveryJobs', () => {
  beforeEach(() => {
    sendTicketEmail.mockReset();
    sendTicketSms.mockReset();
    isTicketSmsDeliveryEnabled.mockReset();
    getPrisma.mockReset();
    isTicketSmsDeliveryEnabled.mockReturnValue(false);
    sendTicketEmail.mockResolvedValue({ ok: true, messageId: 'email_1' });
    sendTicketSms.mockResolvedValue({ ok: true, messageId: 'sms_1' });
  });

  it('sends due email and does not claim SMS while ticket SMS is paused', async () => {
    const { findMany, findUnique } = createPrismaMock();
    findMany.mockResolvedValue([{ id: EMAIL_JOB_ID, channel: 'EMAIL' }]);
    findUnique.mockResolvedValue({
      id: EMAIL_JOB_ID,
      registrationId: REGISTRATION_ID,
      attemptCount: 1,
      templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
      registration: {
        id: REGISTRATION_ID,
        email: 'anna@example.com',
        firstName: 'Anna',
        lastName: 'Sargsyan',
        locale: 'hy',
        ticketCode: 'TEABCDEFGHIJK',
        ticketViewToken: 'view-token',
      },
    });

    const result = await processDueDeliveryJobs();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
          channel: { in: ['EMAIL'] },
        }),
      }),
    );
    expect(sendTicketEmail).toHaveBeenCalledTimes(1);
    expect(sendTicketSms).not.toHaveBeenCalled();
    expect(result).toEqual({ claimed: 1, sent: 1, failed: 0, retried: 0 });
  });

  it('sends a due SMS job when ticket SMS is enabled', async () => {
    isTicketSmsDeliveryEnabled.mockReturnValue(true);
    const { findMany, findUnique } = createPrismaMock();
    findMany.mockResolvedValue([{ id: SMS_JOB_ID, channel: 'SMS' }]);
    findUnique.mockResolvedValue({
      id: SMS_JOB_ID,
      registrationId: REGISTRATION_ID,
      attemptCount: 1,
      templateVersion: TICKET_SMS_TEMPLATE_VERSION,
      registration: {
        id: REGISTRATION_ID,
        phoneNormalized: '+37499123456',
        locale: 'hy',
        ticketViewToken: 'view-token',
      },
    });

    const result = await processDueDeliveryJobs();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          channel: { in: ['EMAIL', 'SMS'] },
        }),
      }),
    );
    expect(sendTicketSms).toHaveBeenCalledWith({
      registrationId: REGISTRATION_ID,
      phoneNormalized: '+37499123456',
      locale: 'hy',
      ticketViewToken: 'view-token',
    });
    expect(sendTicketEmail).not.toHaveBeenCalled();
    expect(result.sent).toBe(1);
  });
});
