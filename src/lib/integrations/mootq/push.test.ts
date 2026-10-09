import { describe, expect, it, afterEach, vi } from 'vitest';
import { executeMootqPushRequest } from '@/lib/integrations/mootq/push-client';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import {
  classifyMootqPushHttpStatus,
  resolvePartnerPushRetryDecision,
} from '@/lib/integrations/mootq/push-outcome';

const registeredAt = new Date('2026-07-27T12:00:00.000Z');

const fullPushInput = {
  sourceRegistrationId: 'reg_abc',
  ticketCode: 'TEABCDEFGHIJK',
  registeredAt,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+37499000001',
  locale: 'hy' as const,
};

describe('buildMootqPushPayload', () => {
  it('sends the partner order envelope', () => {
    const payload = buildMootqPushPayload(fullPushInput);

    expect(payload).toMatchObject({
      event_id: 21,
      items: [{ ticket_type_id: 56, quantity: 1 }],
      buyer: {
        first_name: 'John',
        last_name: 'Doe',
        phone: '+37499000001',
        email: 'john.doe@example.com',
      },
      external_order_ref: 'reg_abc',
    });
    expect(payload.answers.per_order).toEqual({});
    expect(payload.answers.per_ticket).toEqual({});
    expect(payload.answers.per_user).toMatchObject({
      '130': 'John',
      '131': 'Doe',
      '132': '+37499000001',
      '133': 'john.doe@example.com',
    });
    expect(payload).not.toHaveProperty('eventKey');
    expect(payload).not.toHaveProperty('ticketCode');
  });

  it('maps the confirmed market-research example into per_user ids', () => {
    const payload = buildMootqPushPayload({
      ...fullPushInput,
      formVersion: FORM_VERSION,
      answers: {
        ageBand: '25-34',
        residence: { scope: 'yerevan', district: 'kentron' },
        visitPurpose: 'market_research',
        marketInterests: ['new_apartments'],
        researchGoal: 'future_purchase',
        researchLocation: {
          undecided: false,
          yerevanDistricts: ['kentron'],
          marzRegions: [],
        },
        purchaseHorizon: 'up_to_3_months',
        newsletter: false,
      },
    });

    expect(payload.answers.per_user).toMatchObject({
      '134': '25-34 տարեկան',
      '135': 'Երևան',
      '136': 'Կենտրոն',
      '139': 'Շուկայի ուսումնասիրություն և ծանոթացում',
      '167': ['Նորակառույց բնակարաններ'],
      '168': 'Ապագա բնակարան գնելու համար',
      '169': 'Երևան',
      '170': ['Կենտրոն'],
      '173': 'Մինչև 3 ամսվա ընթացքում',
      '152': 'Ոչ',
    });
  });

  it('sends shared answers for other branches and does not invent question ids', () => {
    const payload = buildMootqPushPayload({
      ...fullPushInput,
      formVersion: FORM_VERSION,
      answers: {
        ageBand: '25-34',
        residence: { scope: 'abroad', country: 'Georgia' },
        visitPurpose: 'investment',
        investmentPropertyType: 'apartment',
        locationSeek: {
          yerevanDistricts: ['kentron'],
          marzRegions: [],
          abroadCountries: [],
        },
        investmentGoal: 'rental_income',
        areaSqm: '50-70',
        purchaseMethod: 'cash',
        investmentTimeline: 'up_to_3_months',
        investmentBudgetUsd: 'up_to_150k',
        priorInvestmentExperience: 'no_first',
      },
    });

    expect(payload.answers.per_user['139']).toBe('Հետաքրքրված եմ ներդրումներով');
    expect(payload.answers.per_user['135']).toBe('Արտերկիր');
    expect(payload.answers.per_user['136']).toBe('Georgia');
    expect(payload.answers.per_user).not.toHaveProperty('167');
    expect(payload.answers.per_user).not.toHaveProperty('168');
  });
});

describe('classifyMootqPushHttpStatus', () => {
  it('treats 200/201/204 as success', () => {
    expect(classifyMootqPushHttpStatus(200)).toBe('success');
    expect(classifyMootqPushHttpStatus(201)).toBe('success');
    expect(classifyMootqPushHttpStatus(204)).toBe('success');
  });

  it('treats 429 and 5xx as retryable', () => {
    expect(classifyMootqPushHttpStatus(429)).toBe('retryable');
    expect(classifyMootqPushHttpStatus(500)).toBe('retryable');
    expect(classifyMootqPushHttpStatus(503)).toBe('retryable');
  });

  it('treats other 4xx as permanent', () => {
    expect(classifyMootqPushHttpStatus(400)).toBe('permanent');
    expect(classifyMootqPushHttpStatus(401)).toBe('permanent');
    expect(classifyMootqPushHttpStatus(404)).toBe('permanent');
    expect(classifyMootqPushHttpStatus(422)).toBe('permanent');
  });
});

describe('resolvePartnerPushRetryDecision', () => {
  it('retries with backoff while under the attempt cap', () => {
    expect(resolvePartnerPushRetryDecision({ retryable: true, attemptCount: 1 })).toEqual({
      action: 'retry',
      delaySeconds: 60,
    });
    expect(resolvePartnerPushRetryDecision({ retryable: true, attemptCount: 2 })).toEqual({
      action: 'retry',
      delaySeconds: 300,
    });
  });

  it('fails permanently after max attempts or non-retryable errors', () => {
    expect(resolvePartnerPushRetryDecision({ retryable: true, attemptCount: 5 })).toEqual({
      action: 'fail',
    });
    expect(resolvePartnerPushRetryDecision({ retryable: false, attemptCount: 1 })).toEqual({
      action: 'fail',
    });
  });
});

describe('executeMootqPushRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseParams = {
    url: 'https://mootq.example/push',
    key: 'k'.repeat(32),
    registrationId: 'reg_abc',
    payload: buildMootqPushPayload(fullPushInput),
  };

  it('sends Authorization, Idempotency-Key, and partner body fields', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${baseParams.key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'reg_abc',
      });
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(baseParams.payload);
      expect(body.event_id).toBe(21);
      expect(body.external_order_ref).toBe('reg_abc');
      expect(body).not.toHaveProperty('sourceSystem');
      return new Response(null, { status: 201 });
    });

    const result = await executeMootqPushRequest({ ...baseParams, fetchImpl });
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('maps timeout to retryable failure', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      void init?.signal;
      throw error;
    });

    const result = await executeMootqPushRequest({
      ...baseParams,
      fetchImpl,
      timeoutMs: 5,
    });
    expect(result).toEqual({ ok: false, reason: 'timeout', retryable: true });
  });

  it('maps 429 to retryable and 400 to permanent', async () => {
    const retryResult = await executeMootqPushRequest({
      ...baseParams,
      fetchImpl: vi.fn(async () => new Response(null, { status: 429 })),
    });
    expect(retryResult).toEqual({ ok: false, reason: 'http_429', retryable: true });

    const permanentResult = await executeMootqPushRequest({
      ...baseParams,
      fetchImpl: vi.fn(async () => new Response(null, { status: 400 })),
    });
    expect(permanentResult).toEqual({ ok: false, reason: 'http_400', retryable: false });
  });
});
