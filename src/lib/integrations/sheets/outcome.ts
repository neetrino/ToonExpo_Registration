import {
  SHEETS_PUSH_BACKOFF_SECONDS,
  SHEETS_PUSH_MAX_ATTEMPTS,
} from '@/lib/integrations/sheets/constants';

export type SheetsPushRetryDecision =
  { action: 'retry'; delaySeconds: number } | { action: 'fail' };

/**
 * Decide whether a failed Sheets append should be retried or marked FAILED.
 * `attemptCount` is the value after the current claim increment.
 */
export function resolveSheetsPushRetryDecision(input: {
  retryable: boolean;
  attemptCount: number;
  maxAttempts?: number;
}): SheetsPushRetryDecision {
  const maxAttempts = input.maxAttempts ?? SHEETS_PUSH_MAX_ATTEMPTS;
  if (!input.retryable || input.attemptCount >= maxAttempts) {
    return { action: 'fail' };
  }

  const backoffIndex = Math.min(input.attemptCount - 1, SHEETS_PUSH_BACKOFF_SECONDS.length - 1);
  const delaySeconds = SHEETS_PUSH_BACKOFF_SECONDS[backoffIndex] ?? 3600;
  return { action: 'retry', delaySeconds };
}
