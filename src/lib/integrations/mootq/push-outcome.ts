import {
  MOOTQ_PUSH_BACKOFF_SECONDS,
  MOOTQ_PUSH_MAX_ATTEMPTS,
} from '@/lib/integrations/mootq/push-constants';

export type MootqPushHttpOutcome = 'success' | 'retryable' | 'permanent';

/**
 * Map HTTP status from Mootq push endpoint to delivery outcome.
 * Success: 200/201/204. Retry: 429 and 5xx. Permanent: other 4xx.
 */
export function classifyMootqPushHttpStatus(status: number): MootqPushHttpOutcome {
  if (status === 200 || status === 201 || status === 204) {
    return 'success';
  }
  if (status === 429 || status >= 500) {
    return 'retryable';
  }
  if (status >= 400 && status < 500) {
    return 'permanent';
  }
  return 'retryable';
}

export type PartnerPushRetryDecision =
  { action: 'retry'; delaySeconds: number } | { action: 'fail' };

/**
 * Decide whether a failed attempt should be retried (PENDING + backoff) or FAILED.
 * attemptCount is the value after the current claim increment.
 */
export function resolvePartnerPushRetryDecision(input: {
  retryable: boolean;
  attemptCount: number;
  maxAttempts?: number;
}): PartnerPushRetryDecision {
  const maxAttempts = input.maxAttempts ?? MOOTQ_PUSH_MAX_ATTEMPTS;
  if (!input.retryable || input.attemptCount >= maxAttempts) {
    return { action: 'fail' };
  }

  const backoffIndex = Math.min(input.attemptCount - 1, MOOTQ_PUSH_BACKOFF_SECONDS.length - 1);
  const delaySeconds = MOOTQ_PUSH_BACKOFF_SECONDS[backoffIndex] ?? 3600;
  return { action: 'retry', delaySeconds };
}

export function partnerPushErrorCodeForHttpStatus(status: number): string {
  return `http_${status}`;
}
