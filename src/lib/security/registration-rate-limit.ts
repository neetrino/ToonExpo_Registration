/**
 * Best-effort per-instance registration rate limit (in-memory Map).
 * Serverless instances do not share this state; durable protection belongs at WAF/edge.
 */

export const REGISTRATION_RATE_LIMIT_MAX = 5;
export const REGISTRATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const REGISTRATION_RATE_LIMIT_MAX_KEYS = 10_000;
export const REGISTRATION_MAX_BODY_BYTES = 64 * 1024;

export type Clock = () => number;

type WindowState = {
  hits: number[];
};

const windowsByKey = new Map<string, WindowState>();

/**
 * Extracts client IP from proxy headers, falling back to `unknown`.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Sliding-window rate limit: at most REGISTRATION_RATE_LIMIT_MAX hits
 * within REGISTRATION_RATE_LIMIT_WINDOW_MS per key.
 */
export function checkRegistrationRateLimit(
  key: string,
  clock: Clock = Date.now,
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const now = clock();
  const windowStart = now - REGISTRATION_RATE_LIMIT_WINDOW_MS;
  const state = getOrCreateState(key);
  state.hits = state.hits.filter((hit) => hit > windowStart);

  if (state.hits.length >= REGISTRATION_RATE_LIMIT_MAX) {
    const oldestInWindow = state.hits[0];
    const retryAfterMs =
      oldestInWindow === undefined
        ? REGISTRATION_RATE_LIMIT_WINDOW_MS
        : oldestInWindow + REGISTRATION_RATE_LIMIT_WINDOW_MS - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  state.hits.push(now);
  windowsByKey.set(key, state);
  evictIfNeeded(now);

  return { allowed: true };
}

/** Test-only helper to reset limiter state between cases. */
export function resetRegistrationRateLimitForTests(): void {
  windowsByKey.clear();
}

function getOrCreateState(key: string): WindowState {
  const existing = windowsByKey.get(key);
  if (existing) {
    return existing;
  }

  const created: WindowState = { hits: [] };
  windowsByKey.set(key, created);
  return created;
}

/**
 * Caps Map size by dropping keys whose newest hit is oldest (or empty).
 */
function evictIfNeeded(now: number): void {
  if (windowsByKey.size <= REGISTRATION_RATE_LIMIT_MAX_KEYS) {
    return;
  }

  const overflow = windowsByKey.size - REGISTRATION_RATE_LIMIT_MAX_KEYS;
  const ranked = Array.from(windowsByKey.entries())
    .map(([key, state]) => {
      const newest = state.hits.length > 0 ? (state.hits[state.hits.length - 1] ?? 0) : 0;
      return { key, newest };
    })
    .sort((a, b) => a.newest - b.newest);

  for (let i = 0; i < overflow; i += 1) {
    const entry = ranked[i];
    if (!entry) {
      break;
    }
    windowsByKey.delete(entry.key);
  }

  // Drop fully expired windows opportunistically to free memory sooner.
  const windowStart = now - REGISTRATION_RATE_LIMIT_WINDOW_MS;
  for (const [key, state] of windowsByKey) {
    if (state.hits.every((hit) => hit <= windowStart)) {
      windowsByKey.delete(key);
    }
  }
}
