import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TICKET_EMAIL_TEMPLATE_VERSION,
  TICKET_SMS_TEMPLATE_VERSION,
} from '@/lib/delivery/constants';

const getDexatelSmsConfig = vi.hoisted(() => vi.fn());
const isTicketSmsDeliveryEnabled = vi.hoisted(() => vi.fn());

vi.mock('@/lib/integrations/dexatel/config', () => ({ getDexatelSmsConfig }));
vi.mock('@/lib/delivery/ticket-sms-policy', () => ({ isTicketSmsDeliveryEnabled }));

import { createTicketDeliveryJobs } from '@/lib/delivery/create-ticket-delivery-jobs';

const REGISTRATION_ID = 'reg_1';

function createWriter() {
  const create = vi.fn().mockResolvedValue({});
  return { tx: { deliveryJob: { create } }, create };
}

describe('createTicketDeliveryJobs', () => {
  beforeEach(() => {
    getDexatelSmsConfig.mockReset();
    isTicketSmsDeliveryEnabled.mockReset();
    getDexatelSmsConfig.mockReturnValue({ ok: true, apiKey: 'test-key', from: 'TOONEXPO' });
    isTicketSmsDeliveryEnabled.mockReturnValue(false);
  });

  it('queues only email while ticket SMS is paused', async () => {
    const { tx, create } = createWriter();

    await createTicketDeliveryJobs(tx, REGISTRATION_ID);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        registrationId: REGISTRATION_ID,
        channel: 'EMAIL',
        templateVersion: TICKET_EMAIL_TEMPLATE_VERSION,
        status: 'PENDING',
      }),
    });
  });

  it('queues email and SMS when ticket SMS is enabled and Dexatel is configured', async () => {
    isTicketSmsDeliveryEnabled.mockReturnValue(true);
    const { tx, create } = createWriter();

    await createTicketDeliveryJobs(tx, REGISTRATION_ID);

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        registrationId: REGISTRATION_ID,
        channel: 'SMS',
        templateVersion: TICKET_SMS_TEMPLATE_VERSION,
        status: 'PENDING',
      }),
    });
  });

  it('queues only email when ticket SMS is enabled but Dexatel is not configured', async () => {
    isTicketSmsDeliveryEnabled.mockReturnValue(true);
    getDexatelSmsConfig.mockReturnValue({ ok: false, code: 'NOT_CONFIGURED' });
    const { tx, create } = createWriter();

    await createTicketDeliveryJobs(tx, REGISTRATION_ID);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ channel: 'EMAIL' }),
    });
  });
});
