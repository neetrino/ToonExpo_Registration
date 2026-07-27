/** Max claim/send attempts for PartnerPushDelivery before permanent FAILED. */
export const MOOTQ_PUSH_MAX_ATTEMPTS = 5;

export const MOOTQ_PUSH_CLAIM_BATCH_SIZE = 25;

export const MOOTQ_PUSH_TIMEOUT_MS = 8_000;

/** Backoff seconds after failed attempts (index = attemptCount after increment − 1). */
export const MOOTQ_PUSH_BACKOFF_SECONDS = [60, 300, 900, 3600, 7200] as const;

export const MOOTQ_PUSH_SOURCE_SYSTEM = 'TOON_EXPO' as const;
