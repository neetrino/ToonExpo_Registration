import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';

const getPrisma = vi.hoisted(() => vi.fn());
const createTicketDeliveryJobs = vi.hoisted(() => vi.fn());
const processDueDeliveryJobs = vi.hoisted(() => vi.fn());
const getDexatelSmsConfig = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({ getPrisma }));
vi.mock('@/lib/delivery/create-ticket-delivery-jobs', () => ({ createTicketDeliveryJobs }));
vi.mock('@/lib/delivery/process-delivery-jobs', () => ({ processDueDeliveryJobs }));
vi.mock('@/lib/integrations/dexatel/config', () => ({ getDexatelSmsConfig }));

import { resendRegistrationTicket } from '@/lib/admin/resend-ticket';

const EMAIL_JOB_ID = 'job_email';
const SMS_JOB_ID = 'job_sms';
const REGISTRATION_ID = 'reg_1';
const EVENT_ID = 'evt_1';
const ORIGINAL_TICKET = 'TEHV6TUGERFQB';
const ORIGINAL_TOKEN = 'view-token-unchanged';

function createPrismaMock(options: {
  event: { id: string } | null;
  registration: Record<string, unknown> | null;
}) {
  const deliveryJobUpdate = vi.fn();
  const deliveryJobCreate = vi.fn();
  const registrationUpdate = vi.fn();
  const tx = {
    deliveryJob: { update: deliveryJobUpdate, create: deliveryJobCreate },
    registration: { update: registrationUpdate },
  };

  const prisma = {
    event: {
      findFirst: vi.fn().mockResolvedValue(options.event),
    },
    registration: {
      findFirst: vi.fn().mockResolvedValue(options.registration),
      update: registrationUpdate,
    },
    deliveryJob: {
      update: deliveryJobUpdate,
      create: deliveryJobCreate,
    },
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<void>) => fn(tx)),
  };

  getPrisma.mockReturnValue(prisma);
  return { prisma, tx, deliveryJobUpdate, deliveryJobCreate, registrationUpdate };
}

describe('resendRegistrationTicket', () => {
  beforeEach(() => {
    createTicketDeliveryJobs.mockReset();
    processDueDeliveryJobs.mockReset();
    getDexatelSmsConfig.mockReset();
    getPrisma.mockReset();
    processDueDeliveryJobs.mockResolvedValue({ claimed: 2, sent: 2, failed: 0, retried: 0 });
    getDexatelSmsConfig.mockReturnValue({ ok: true, apiKey: 'test-key', from: 'TOONEXPO' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not send when there is no active event', async () => {
    createPrismaMock({ event: null, registration: null });

    await expect(resendRegistrationTicket(REGISTRATION_ID)).resolves.toEqual({
      ok: false,
      error: 'No active event.',
    });
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
  });

  it('does not send when the ticket is missing', async () => {
    createPrismaMock({
      event: { id: EVENT_ID },
      registration: {
        id: REGISTRATION_ID,
        ticketCode: null,
        ticketViewToken: ORIGINAL_TOKEN,
        emailLastAttemptAt: null,
        deliveryJobs: [],
      },
    });

    await expect(resendRegistrationTicket(REGISTRATION_ID)).resolves.toEqual({
      ok: false,
      error: 'This registration has no ticket to send.',
    });
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
  });

  it('requeues the existing email and SMS jobs without changing the ticket code', async () => {
    const { deliveryJobUpdate, deliveryJobCreate, registrationUpdate, prisma } = createPrismaMock({
      event: { id: EVENT_ID },
      registration: {
        id: REGISTRATION_ID,
        ticketCode: ORIGINAL_TICKET,
        ticketViewToken: ORIGINAL_TOKEN,
        emailLastAttemptAt: new Date('2026-08-14T09:00:00.000Z'),
        deliveryJobs: [
          {
            id: EMAIL_JOB_ID,
            channel: 'EMAIL',
            status: 'SENT',
            templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
          },
          {
            id: SMS_JOB_ID,
            channel: 'SMS',
            status: 'SENT',
            templateVersion: TICKET_SMS_TEMPLATE_VERSION,
          },
        ],
      },
    });

    await expect(resendRegistrationTicket(REGISTRATION_ID)).resolves.toEqual({
      ok: true,
      emailQueued: true,
      smsQueued: true,
    });

    expect(prisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: REGISTRATION_ID, eventId: EVENT_ID },
      }),
    );
    expect(deliveryJobUpdate).toHaveBeenCalledTimes(2);
    expect(deliveryJobUpdate).toHaveBeenCalledWith({
      where: { id: EMAIL_JOB_ID },
      data: expect.objectContaining({ status: 'PENDING', attemptCount: 0 }),
    });
    expect(deliveryJobUpdate).toHaveBeenCalledWith({
      where: { id: SMS_JOB_ID },
      data: expect.objectContaining({ status: 'PENDING', attemptCount: 0 }),
    });
    expect(deliveryJobCreate).not.toHaveBeenCalled();
    expect(createTicketDeliveryJobs).not.toHaveBeenCalled();
    expect(registrationUpdate).toHaveBeenCalledWith({
      where: { id: REGISTRATION_ID },
      data: {
        emailDeliveryStatus: 'PENDING',
        emailLastAttemptAt: expect.any(Date),
      },
    });
    expect(registrationUpdate.mock.calls[0]?.[0]?.data).not.toHaveProperty('ticketCode');
    expect(registrationUpdate.mock.calls[0]?.[0]?.data).not.toHaveProperty('ticketViewToken');
    expect(processDueDeliveryJobs).toHaveBeenCalledWith({
      registrationId: REGISTRATION_ID,
      limit: expect.any(Number),
    });
  });

  it('creates jobs when none exist yet', async () => {
    createPrismaMock({
      event: { id: EVENT_ID },
      registration: {
        id: REGISTRATION_ID,
        ticketCode: ORIGINAL_TICKET,
        ticketViewToken: ORIGINAL_TOKEN,
        emailLastAttemptAt: null,
        deliveryJobs: [],
      },
    });

    await expect(resendRegistrationTicket(REGISTRATION_ID)).resolves.toEqual({
      ok: true,
      emailQueued: true,
      smsQueued: true,
    });
    expect(createTicketDeliveryJobs).toHaveBeenCalledWith(expect.anything(), REGISTRATION_ID);
  });

  it('skips SMS when Dexatel is not configured', async () => {
    getDexatelSmsConfig.mockReturnValue({ ok: false, code: 'NOT_CONFIGURED' });
    const { deliveryJobUpdate } = createPrismaMock({
      event: { id: EVENT_ID },
      registration: {
        id: REGISTRATION_ID,
        ticketCode: ORIGINAL_TICKET,
        ticketViewToken: ORIGINAL_TOKEN,
        emailLastAttemptAt: new Date('2026-08-14T09:00:00.000Z'),
        deliveryJobs: [
          {
            id: EMAIL_JOB_ID,
            channel: 'EMAIL',
            status: 'SENT',
            templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
          },
          {
            id: SMS_JOB_ID,
            channel: 'SMS',
            status: 'SENT',
            templateVersion: TICKET_SMS_TEMPLATE_VERSION,
          },
        ],
      },
    });

    await expect(resendRegistrationTicket(REGISTRATION_ID)).resolves.toEqual({
      ok: true,
      emailQueued: true,
      smsQueued: false,
    });
    expect(deliveryJobUpdate).toHaveBeenCalledTimes(1);
    expect(deliveryJobUpdate).toHaveBeenCalledWith({
      where: { id: EMAIL_JOB_ID },
      data: expect.objectContaining({ status: 'PENDING' }),
    });
  });
});
