/** Logical email template version for DeliveryJob uniqueness. */
export const TICKET_EMAIL_TEMPLATE_VERSION = 'ticket-v1';

export const DELIVERY_MAX_ATTEMPTS = 5;
export const DELIVERY_CLAIM_BATCH_SIZE = 10;
export const DELIVERY_PROVIDER_TIMEOUT_MS = 8_000;

/** Backoff seconds after failed attempts (index = attemptCount after increment). */
export const DELIVERY_BACKOFF_SECONDS = [60, 300, 900, 3600, 7200] as const;

export const TICKET_QR_CONTENT_ID = 'ticket-qr';
