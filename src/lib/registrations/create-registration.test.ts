import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation/constants';
import type { CreateRegistrationInput } from '@/lib/registrations/create-registration';

const getPrisma = vi.hoisted(() => vi.fn());
const processDueDeliveryJobs = vi.hoisted(() => vi.fn());
const getDexatelSmsConfig = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db/prisma', () => ({ getPrisma }));
vi.mock('@/lib/delivery/process-delivery-jobs', () => ({ processDueDeliveryJobs }));
vi.mock('@/lib/integrations/dexatel/config', () => ({ getDexatelSmsConfig }));

import { createRegistration } from '@/lib/registrations/create-registration';

const EVENT_ID = 'evt_1';
const REGISTRATION_ID = 'reg_1';

const input: CreateRegistrationInput = {
  firstName: 'Anna',
  lastName: 'Sargsyan',
  email: 'anna@example.com',
  emailNormalized: 'anna@example.com',
  phone: '+37499123456',
  phoneNormalized: '+37499123456',
  locale: 'hy',
  privacyPolicyVersion: PRIVACY_POLICY_VERSION,
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
  utmSource: undefined,
  utmMedium: undefined,
  utmCampaign: undefined,
  idempotencyKey: 'idem-key-1',
};

function createPrismaMock(options: {
  event: { id: string } | null;
  existing?: { id: string; ticketCode: string; ticketViewToken: string } | null;
}) {
  const deliveryJobCreate = vi.fn();
  const registrationCreate = vi
    .fn()
    .mockImplementation(
      async ({ data }: { data: { ticketCode: string; ticketViewToken: string } }) => ({
        id: REGISTRATION_ID,
        ticketCode: data.ticketCode,
        ticketViewToken: data.ticketViewToken,
      }),
    );
  const tx = {
    registration: { create: registrationCreate },
    partnerFeedEvent: { create: vi.fn() },
    deliveryJob: { create: deliveryJobCreate },
    partnerPushDelivery: { create: vi.fn() },
  };

  const prisma = {
    event: {
      findFirst: vi.fn().mockResolvedValue(options.event),
    },
    registration: {
      findFirst: vi.fn().mockResolvedValue(options.existing ?? null),
    },
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
  };

  getPrisma.mockReturnValue(prisma);
  return { prisma, tx, deliveryJobCreate };
}

describe('createRegistration', () => {
  beforeEach(() => {
    processDueDeliveryJobs.mockReset();
    getDexatelSmsConfig.mockReset();
    getPrisma.mockReset();
    processDueDeliveryJobs.mockResolvedValue({ claimed: 2, sent: 2, failed: 0, retried: 0 });
    getDexatelSmsConfig.mockReturnValue({ ok: true, apiKey: 'test-key', from: 'TOONEXPO' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the ticket without processing delivery jobs', async () => {
    const { deliveryJobCreate, prisma } = createPrismaMock({ event: { id: EVENT_ID } });

    const result = await createRegistration(input);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.registrationId).toBe(REGISTRATION_ID);
    expect(result.ticketCode).toMatch(/^TE[A-Z0-9]{11}$/);
    expect(result.ticketViewToken.length).toBeGreaterThan(0);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(deliveryJobCreate).toHaveBeenCalledTimes(2);
    expect(deliveryJobCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        registrationId: REGISTRATION_ID,
        channel: 'EMAIL',
        status: 'PENDING',
      }),
    });
    expect(deliveryJobCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        registrationId: REGISTRATION_ID,
        channel: 'SMS',
        status: 'PENDING',
      }),
    });
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
  });

  it('does not process delivery on idempotent replay', async () => {
    createPrismaMock({
      event: { id: EVENT_ID },
      existing: {
        id: REGISTRATION_ID,
        ticketCode: 'TEEXISTING001',
        ticketViewToken: 'existing-token',
      },
    });

    await expect(createRegistration(input)).resolves.toEqual({
      ok: true,
      registrationId: REGISTRATION_ID,
      ticketCode: 'TEEXISTING001',
      ticketViewToken: 'existing-token',
    });
    expect(processDueDeliveryJobs).not.toHaveBeenCalled();
  });
});
