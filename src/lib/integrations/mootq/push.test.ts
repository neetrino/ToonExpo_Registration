import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeMootqPushRequest } from '@/lib/integrations/mootq/push-client';
import { buildMootqPushPayload } from '@/lib/integrations/mootq/push-payload';
import {
  classifyMootqPushHttpStatus,
  resolvePartnerPushRetryDecision,
} from '@/lib/integrations/mootq/push-outcome';

describe('buildMootqPushPayload', () => {
  it('builds the minimal Toon Expo push body', () => {
    const createdAt = new Date('2026-07-27T12:00:00.000Z');
    expect(
      buildMootqPushPayload({
        registrationId: 'reg_123',
        ticketCode: 'TEABCDEFGHIJK',
        createdAt,
      }),
    ).toEqual({
      sourceRegistrationId: 'reg_123',
      ticketCode: 'TEABCDEFGHIJK',
      sourceSystem: 'TOON_EXPO',
      createdAt: '2026-07-27T12:00:00.000Z',
    });
  });

  it('includes optional UTM fields when present and omits when absent', () => {
    const createdAt = new Date('2026-07-27T12:00:00.000Z');
    expect(
      buildMootqPushPayload({
        registrationId: 'reg_123',
        ticketCode: 'TEABCDEFGHIJK',
        createdAt,
        utmSource: 'facebook',
        utmMedium: null,
        utmCampaign: 'tey26',
      }),
    ).toEqual({
      sourceRegistrationId: 'reg_123',
      ticketCode: 'TEABCDEFGHIJK',
      sourceSystem: 'TOON_EXPO',
      createdAt: '2026-07-27T12:00:00.000Z',
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
    payload: buildMootqPushPayload({
      registrationId: 'reg_abc',
      ticketCode: 'TEABCDEFGHIJK',
      createdAt: new Date('2026-07-27T12:00:00.000Z'),
    }),
  };

  it('sends Authorization, Idempotency-Key, and JSON body', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${baseParams.key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'reg_abc',
      });
      expect(JSON.parse(String(init?.body))).toEqual(baseParams.payload);
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
