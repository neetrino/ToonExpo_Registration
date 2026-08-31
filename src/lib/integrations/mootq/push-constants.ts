/** Max claim/send attempts for PartnerPushDelivery before permanent FAILED. */
export const MOOTQ_PUSH_MAX_ATTEMPTS = 5;

export const MOOTQ_PUSH_CLAIM_BATCH_SIZE = 25;

export const MOOTQ_PUSH_TIMEOUT_MS = 8_000;

/** Minimum gap between outbound POSTs in one dispatcher run (5 req/s). */
export const MOOTQ_PUSH_MIN_INTERVAL_MS = 200;

/** Backoff seconds after failed attempts (index = attemptCount after increment − 1). */
export const MOOTQ_PUSH_BACKOFF_SECONDS = [60, 300, 900, 3600, 7200] as const;
