import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation/constants';
import { DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE } from '@/lib/delivery/constants';

const afterCallbacks = vi.hoisted(() => [] as Array<() => unknown>);
const afterMock = vi.hoisted(() =>
  vi.fn((callback: () => unknown) => {
    afterCallbacks.push(callback);
  }),
);
const createRegistration = vi.hoisted(() => vi.fn());
const processDueDeliveryJobs = vi.hoisted(() => vi.fn());
const processDuePartnerPushes = vi.hoisted(() => vi.fn());
const isAllowedOrigin = vi.hoisted(() => vi.fn(() => true));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    after: afterMock,
  };
});

vi.mock('@/lib/registrations', () => ({ createRegistration }));
vi.mock('@/lib/delivery/process-delivery-jobs', () => ({ processDueDeliveryJobs }));
vi.mock('@/lib/integrations/mootq/process-partner-pushes', () => ({ processDuePartnerPushes }));
vi.mock('@/lib/security', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/security')>();
  return {
    ...actual,
    isAllowedOrigin,
  };
});

import { POST } from '@/app/api/registrations/route';

const REGISTRATION_ID = 'reg_created_1';
const TICKET_CODE = 'TEABCDEFGHIJK';
const TICKET_VIEW_TOKEN = 'view-token-1';

const validBody = {
  firstName: 'Anna',
  lastName: 'Sargsyan',
  email: 'anna@example.com',
  phone: '99123456',
  phoneCountry: 'AM',
  locale: 'hy',
  privacyConsent: true,
  privacyPolicyVersion: PRIVACY_POLICY_VERSION,
  website: '',
  formVersion: FORM_VERSION,
  answers: {
    ageBand: '35-44',
    residence: { scope: 'yerevan', district: 'kentron' },
    visitPurpose: 'own_residence',
    interestType: 'apartment_new',
    locationSeek: {
      yerevanDistricts: ['kentron'],
      marzRegions: [],
      abroadCountries: [],
    },
    areaSqm: '70-90',
    purchaseMethod: 'mortgage',
    monthlyBudget: '300k-500k',
    decisionStage: 'searching_6_months',
    newsletter: true,
  },
};

function registrationRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/registrations', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': 'idem-key-route-1',
    },
    body: JSON.stringify(body),
  });
}

async function flushAfterCallbacks(): Promise<void> {
  const pending = [...afterCallbacks];
  afterCallbacks.length = 0;
  await Promise.all(pending.map((callback) => callback()));
}

describe('POST /api/registrations', () => {
  beforeEach(() => {
    afterCallbacks.length = 0;
    afterMock.mockClear();
    createRegistration.mockReset();
    processDueDeliveryJobs.mockReset();
    processDuePartnerPushes.mockReset();
    isAllowedOrigin.mockReset();
    isAllowedOrigin.mockReturnValue(true);
    processDueDeliveryJobs.mockResolvedValue({ claimed: 2, sent: 2, failed: 0, retried: 0 });
    processDuePartnerPushes.mockResolvedValue({ claimed: 1, sent: 1, failed: 0, retried: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 without waiting for delivery provider I/O', async () => {
    let resolveDelivery:
      | ((value: { claimed: number; sent: number; failed: number; retried: number }) => void)
      | undefined;
    const deliveryStarted = vi.fn();
    processDueDeliveryJobs.mockImplementation(
      () =>
        new Promise((resolve) => {
          deliveryStarted();
          resolveDelivery = resolve;
        }),
    );
    createRegistration.mockResolvedValue({
      ok: true,
      registrationId: REGISTRATION_ID,
      ticketCode: TICKET_CODE,
      ticketViewToken: TICKET_VIEW_TOKEN,
    });

    const response = await POST(registrationRequest(validBody));
    const json = (await response.json()) as {
      ok: boolean;
      registrationId: string;
      ticketCode: string;
      ticketViewToken: string;
    };

    expect(response.status).toBe(201);
    expect(json).toMatchObject({
      ok: true,
      registrationId: REGISTRATION_ID,
      ticketCode: TICKET_CODE,
      ticketViewToken: TICKET_VIEW_TOKEN,
    });
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
    expect(processDuePartnerPushes).not.toHaveBeenCalled();
    expect(deliveryStarted).not.toHaveBeenCalled();
    expect(afterMock).toHaveBeenCalledTimes(1);

    const afterWork = flushAfterCallbacks();
    expect(processDueDeliveryJobs).toHaveBeenCalledWith({
      registrationId: REGISTRATION_ID,
      limit: DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
    });
    expect(resolveDelivery).toBeDefined();
    resolveDelivery?.({ claimed: 2, sent: 2, failed: 0, retried: 0 });
    await afterWork;

    expect(processDuePartnerPushes).toHaveBeenCalledWith({
      registrationId: REGISTRATION_ID,
      limit: 1,
    });
  });

  it('does not schedule delivery for a honeypot fake 201', async () => {
    const response = await POST(
      registrationRequest({
        ...validBody,
        website: 'https://spam.example',
      }),
    );
    const json = (await response.json()) as {
      ok: boolean;
      ticketCode: string;
      ticketViewToken: string;
    };

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.ticketCode).toBe('invalid');
    expect(json.ticketViewToken).toBe('invalid');
    expect(createRegistration).not.toHaveBeenCalled();
    expect(afterMock).not.toHaveBeenCalled();
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
    expect(processDuePartnerPushes).not.toHaveBeenCalled();
  });

  it('does not schedule delivery on validation errors', async () => {
    const response = await POST(registrationRequest({ ...validBody, email: 'not-an-email' }));

    expect(response.status).toBe(400);
    expect(createRegistration).not.toHaveBeenCalled();
    expect(afterMock).not.toHaveBeenCalled();
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
  });
});
