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
  /** Server `Retry-After`; the wait is never shorter than this. */
  retryAfterSeconds?: number;
}): PartnerPushRetryDecision {
  const maxAttempts = input.maxAttempts ?? MOOTQ_PUSH_MAX_ATTEMPTS;
  if (!input.retryable || input.attemptCount >= maxAttempts) {
    return { action: 'fail' };
  }

  const backoffIndex = Math.min(input.attemptCount - 1, MOOTQ_PUSH_BACKOFF_SECONDS.length - 1);
  const backoffSeconds = MOOTQ_PUSH_BACKOFF_SECONDS[backoffIndex] ?? 3600;
  return { action: 'retry', delaySeconds: Math.max(backoffSeconds, input.retryAfterSeconds ?? 0) };
}

export function partnerPushErrorCodeForHttpStatus(status: number): string {
  return `http_${status}`;
}

const REJECTION_MESSAGE_MAX_LENGTH = 300;
const REJECTION_FIELDS_MAX = 30;

export type MootqRejectionSummary = { message?: string; errorFields?: string };

/**
 * Loggable part of a Mootq error body: `message` and the rejected field names.
 * Field error texts are not kept because they may echo submitted personal data.
 */
export function summarizeMootqRejection(body: string): MootqRejectionSummary {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return {};
  }

  const summary: MootqRejectionSummary = {};
  const { message, errors } = parsed as { message?: unknown; errors?: unknown };
  if (typeof message === 'string') {
    summary.message = message.slice(0, REJECTION_MESSAGE_MAX_LENGTH);
  }
  if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
    summary.errorFields = Object.keys(errors).slice(0, REJECTION_FIELDS_MAX).join(',');
  }
  return summary;
}

/** `Retry-After` in whole seconds (delta form only); undefined when absent or invalid. */
export function parseRetryAfterSeconds(header: string | null): number | undefined {
  if (!header || !/^\d+$/.test(header.trim())) {
    return undefined;
  }
  const seconds = Number(header.trim());
  return seconds >= 1 ? seconds : undefined;
}
