import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeMootqPushRequest } from '@/lib/integrations/mootq/push-client';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import {
  classifyMootqPushHttpStatus,
  resolvePartnerPushRetryDecision,
} from '@/lib/integrations/mootq/push-outcome';

const registeredAt = new Date('2026-07-27T12:00:00.000Z');

const fullPushInput = {
  ticketCode: 'TEABCDEFGHIJK',
  registeredAt,
  firstName: 'Example',
  lastName: 'Visitor',
  email: 'visitor@example.com',
  phone: '+37499123456',
  locale: 'hy' as const,
};

describe('buildMootqPushPayload', () => {
  it('builds the full Toon Expo push body without source ids', () => {
    expect(buildMootqPushPayload(fullPushInput)).toEqual({
      ticketCode: 'TEABCDEFGHIJK',
      registeredAt: '2026-07-27T12:00:00.000Z',
      firstName: 'Example',
      lastName: 'Visitor',
      email: 'visitor@example.com',
      phone: '+37499123456',
      locale: 'hy',
    });
  });

  it('includes flattened answers and omits absent UTM keys', () => {
    expect(
      buildMootqPushPayload({
        ...fullPushInput,
        formVersion: FORM_VERSION,
        answers: {
          ageBand: '25-34',
          visitPurpose: 'investment',
          investmentPropertyType: 'apartment',
          investmentMarket: 'armenia',
          investmentGoal: 'rental_income',
          investmentTimeline: '6_months',
          investmentBudgetUsd: '100k-250k',
          priorInvestmentExperience: 'no_first',
          newsletter: false,
        },
        utmSource: 'facebook',
        utmMedium: null,
        utmCampaign: 'tey26',
      }),
    ).toEqual({
      ticketCode: 'TEABCDEFGHIJK',
      registeredAt: '2026-07-27T12:00:00.000Z',
      firstName: 'Example',
      lastName: 'Visitor',
      email: 'visitor@example.com',
      phone: '+37499123456',
      locale: 'hy',
      answers: {
        form_version: FORM_VERSION,
        age_band: '25-34',
        visit_purpose: 'investment',
        newsletter: false,
        investment_property_type: 'apartment',
        investment_market: 'armenia',
        investment_goal: 'rental_income',
        investment_timeline: '6_months',
        investment_budget_usd: '100k-250k',
        prior_investment_experience: 'no_first',
      },
      utmSource: 'facebook',
      utmCampaign: 'tey26',
    });
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

  it('sends Authorization, Idempotency-Key, and JSON body without source ids', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${baseParams.key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'reg_abc',
      });
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual(baseParams.payload);
      expect(body).not.toHaveProperty('sourceRegistrationId');
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
