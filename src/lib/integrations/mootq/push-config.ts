export type MootqPushConfig =
  { ok: true; url: string; key: string; eventKey: string } | { ok: false; code: 'NOT_CONFIGURED' };

/**
 * Read optional Mootq fast-push credentials at call time.
 * Unset/invalid config must not fail registration; outbox rows stay PENDING.
 */
export function getMootqPushConfig(): MootqPushConfig {
  const url = process.env.MOOTQ_PUSH_URL?.trim();
  const key = process.env.MOOTQ_PUSH_KEY?.trim();
  const eventKey = process.env.MOOTQ_EVENT_KEY?.trim();

  if (!url || !key || key.length < 32 || !eventKey) {
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  try {
    void new URL(url);
  } catch {
    return { ok: false, code: 'NOT_CONFIGURED' };
  }

  return { ok: true, url, key, eventKey };
}
