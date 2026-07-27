const IDEMPOTENCY_STORAGE_KEY = 'toon-expo-registration-idempotency-v1';

/**
 * Stable client idempotency key for accidental double-submit.
 * Persisted in sessionStorage for the browser tab lifetime of the form.
 */
export function getOrCreateRegistrationIdempotencyKey(): string {
  if (typeof window === 'undefined') {
    return crypto.randomUUID();
  }

  try {
    const existing = window.sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,128}$/.test(existing)) {
      return existing;
    }

    const created = crypto.randomUUID();
    window.sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function clearRegistrationIdempotencyKey(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
