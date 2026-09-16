export const SHEETS_PUSH_MAX_ATTEMPTS = 5;

export const SHEETS_PUSH_CLAIM_BATCH_SIZE = 25;

export const SHEETS_PUSH_TIMEOUT_MS = 8_000;

export const SHEETS_PUSH_MIN_INTERVAL_MS = 200;

export const SHEETS_PUSH_BACKOFF_SECONDS = [60, 300, 900, 3600, 7200] as const;

/** Max cells accepted by the Apps Script webhook (headers + identity + answers). */
export const SHEETS_PUSH_MAX_VALUES = 80;

/** Soft cap per cell; Apps Script mirrors this. */
export const SHEETS_PUSH_MAX_CELL_CHARS = 500;

export const SHEETS_WEBHOOK_URL_ENV = 'SHEETS_WEBHOOK_URL';
export const SHEETS_WEBHOOK_SECRET_ENV = 'SHEETS_WEBHOOK_SECRET';
export const SHEETS_PUSH_CRON_ENABLED_ENV = 'SHEETS_PUSH_CRON_ENABLED';
