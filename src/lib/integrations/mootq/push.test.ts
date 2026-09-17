import { describe, expect, it, afterEach, vi } from 'vitest';
import { executeMootqPushRequest } from '@/lib/integrations/mootq/push-client';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import { MOOTQ_FIELD } from '@/lib/integrations/mootq/mootq-field-ids';
import {
  classifyMootqPushHttpStatus,
  resolvePartnerPushRetryDecision,
} from '@/lib/integrations/mootq/push-outcome';

const registeredAt = new Date('2026-07-27T12:00:00.000Z');

const fullPushInput = {
  eventKey: 'toon-expo-2026',
  sourceRegistrationId: 'reg_abc',
  ticketCode: 'TEABCDEFGHIJK',
  registeredAt,
  firstName: 'Example',
  lastName: 'Visitor',
  email: 'visitor@example.com',
  phone: '+37499123456',
  locale: 'hy' as const,
};

describe('buildMootqPushPayload', () => {
  it('includes eventKey, sourceRegistrationId and identity answers', () => {
    const payload = buildMootqPushPayload(fullPushInput);
    expect(payload.eventKey).toBe('toon-expo-2026');
    expect(payload.sourceRegistrationId).toBe('reg_abc');
    expect(payload.ticketCode).toBe('TEABCDEFGHIJK');
    expect(payload.answers).toMatchObject({
      first_name: 'Example',
      last_name: 'Visitor',
      email: 'visitor@example.com',
      phone: '+37499123456',
    });
  });

  it('maps market_research answers to Mootq field_* labels', () => {
    const payload = buildMootqPushPayload({
      ...fullPushInput,
      formVersion: FORM_VERSION,
      answers: {
        ageBand: '25-34',
        residence: { scope: 'abroad', country: 'Georgia' },
        visitPurpose: 'market_research',
        marketInterests: ['new_apartments'],
        researchGoal: 'browse_offers',
        researchLocation: {
          undecided: false,
          yerevanDistricts: [],
          marzRegions: [],
          abroadCountry: 'Georgia',
        },
        purchaseHorizon: 'no_plans',
        newsletter: false,
      },
      utmSource: 'facebook',
      utmMedium: null,
      utmCampaign: 'tey26',
    });

    expect(payload.answers[MOOTQ_FIELD.ageBand]).toBe('25-34 տարեկան');
    expect(payload.answers[MOOTQ_FIELD.residenceScope]).toBe('Արտերկիր');
    expect(payload.answers[MOOTQ_FIELD.residenceDetail]).toBe('Georgia');
    expect(payload.answers[MOOTQ_FIELD.visitPurpose]).toBe(
      'Շուկայի ուսումնասիրություն և ծանոթացում',
    );
    expect(payload.answers[MOOTQ_FIELD.newsletter]).toBe('Ոչ');
    expect(payload.answers[MOOTQ_FIELD.marketInterests]).toEqual(['Նորակառույց բնակարաններ']);
    expect(payload.answers[MOOTQ_FIELD.researchGoal]).toBe(
      'Պարզապես ցանկանում եմ ծանոթանալ առաջարկներին',
    );
    expect(payload.answers[MOOTQ_FIELD.purchaseHorizon]).toBe('Այս պահին նման պլան չունեմ');
    expect(payload.utmSource).toBe('facebook');
    expect(payload.utmCampaign).toBe('tey26');
    expect(payload).not.toHaveProperty('utmMedium');
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
      expect(body.eventKey).toBe('toon-expo-2026');
      expect(body.sourceRegistrationId).toBe('reg_abc');
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
