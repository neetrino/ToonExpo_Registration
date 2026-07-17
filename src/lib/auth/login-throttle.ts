/**
 * In-memory login attempt throttle for single-instance MVP.
 *
 * Limitation: state is per process and resets on deploy/restart; it does not
 * coordinate across multiple Vercel instances. Prefer edge/WAF limits in
 * production for durable protection.
 */

const MAX_FAILURES = 5;
const LOCK_DURATION_MS = 60_000;

type AttemptState = {
  failures: number;
  lockedUntilMs: number | null;
};

const attemptsByKey = new Map<string, AttemptState>();

function getState(key: string): AttemptState {
  const existing = attemptsByKey.get(key);
  if (existing) {
    return existing;
  }
  const created: AttemptState = { failures: 0, lockedUntilMs: null };
  attemptsByKey.set(key, created);
  return created;
}

/**
 * Returns whether a login attempt may proceed for the given key (email or IP).
 */
export function isLoginAllowed(
  key: string,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const state = getState(key);
  const now = Date.now();

  if (state.lockedUntilMs !== null && state.lockedUntilMs > now) {
    return { allowed: false, retryAfterMs: state.lockedUntilMs - now };
  }

  if (state.lockedUntilMs !== null && state.lockedUntilMs <= now) {
    state.failures = 0;
    state.lockedUntilMs = null;
  }

  return { allowed: true };
}

/**
 * Record a failed credentials attempt. Locks the key after MAX_FAILURES.
 */
export function recordLoginFailure(key: string): void {
  const state = getState(key);
  state.failures += 1;

  if (state.failures >= MAX_FAILURES) {
    state.lockedUntilMs = Date.now() + LOCK_DURATION_MS;
    state.failures = 0;
  }
}

/**
 * Clear throttle state after a successful login.
 */
export function recordLoginSuccess(key: string): void {
  attemptsByKey.delete(key);
}

/** Test-only helper to reset throttle state between cases. */
export function resetLoginThrottleForTests(): void {
  attemptsByKey.clear();
}
