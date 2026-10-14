import { describe, expect, it } from 'vitest';
import {
  classifyMootqPushHttpStatus,
  parseRetryAfterSeconds,
  resolvePartnerPushRetryDecision,
  summarizeMootqRejection,
} from '@/lib/integrations/mootq/push-outcome';

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

  it('never waits less than Retry-After', () => {
    expect(
      resolvePartnerPushRetryDecision({ retryable: true, attemptCount: 1, retryAfterSeconds: 900 }),
    ).toEqual({ action: 'retry', delaySeconds: 900 });
    expect(
      resolvePartnerPushRetryDecision({ retryable: true, attemptCount: 2, retryAfterSeconds: 5 }),
    ).toEqual({ action: 'retry', delaySeconds: 300 });
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

describe('summarizeMootqRejection', () => {
  it('keeps the message and field names but not field error texts', () => {
    const body = JSON.stringify({
      message: 'The given data was invalid.',
      errors: { 'answers.field_1': ['john.doe@example.com is invalid'], eventKey: ['Required'] },
    });
    expect(summarizeMootqRejection(body)).toEqual({
      message: 'The given data was invalid.',
      errorFields: 'answers.field_1,eventKey',
    });
  });

  it('returns an empty summary for empty or non-JSON bodies', () => {
    expect(summarizeMootqRejection('')).toEqual({});
    expect(summarizeMootqRejection('<html>')).toEqual({});
  });
});

describe('parseRetryAfterSeconds', () => {
  it('reads whole seconds and ignores invalid values', () => {
    expect(parseRetryAfterSeconds('30')).toBe(30);
    expect(parseRetryAfterSeconds(null)).toBeUndefined();
    expect(parseRetryAfterSeconds('0')).toBeUndefined();
    expect(parseRetryAfterSeconds('Wed, 21 Oct 2026 07:28:00 GMT')).toBeUndefined();
  });
});
