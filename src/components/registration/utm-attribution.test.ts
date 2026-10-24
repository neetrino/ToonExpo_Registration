import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type UtmAttributionModule = typeof import('@/components/registration/utm-attribution');

const STORAGE_KEY = 'toon-expo-registration-utm-v2';
const LEGACY_KEY = 'toon-expo-registration-utm-v1';

async function loadModule(): Promise<UtmAttributionModule> {
  vi.resetModules();
  return import('@/components/registration/utm-attribution');
}

function land(search: string): void {
  window.history.replaceState(null, '', `/hy${search}`);
}

describe('utm-attribution', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('keeps the campaign after returning to a clean URL', async () => {
    const utm = await loadModule();
    land('?utm_source=fb&utm_campaign=SP+Flexible');
    utm.captureAndPersistUtmFromLocation();

    land('');
    utm.captureAndPersistUtmFromLocation();

    expect(utm.loadPersistedUtmAttribution()).toEqual({
      utmSource: 'fb',
      utmCampaign: 'SP Flexible',
    });
  });

  it('survives a reload via localStorage', async () => {
    land('?utm_source=fb');
    (await loadModule()).captureAndPersistUtmFromLocation();

    land('');
    expect((await loadModule()).loadPersistedUtmAttribution()).toEqual({ utmSource: 'fb' });
  });

  it('replaces the campaign on a new UTM landing (last non-direct touch)', async () => {
    const utm = await loadModule();
    land('?utm_source=fb&utm_medium=video&utm_campaign=old');
    utm.captureAndPersistUtmFromLocation();

    land('?utm_source=google');
    utm.captureAndPersistUtmFromLocation();

    expect(utm.loadPersistedUtmAttribution()).toEqual({ utmSource: 'google' });
  });

  it('expires attribution after the TTL', async () => {
    vi.useFakeTimers();
    const utm = await loadModule();
    land('?utm_source=fb');
    utm.captureAndPersistUtmFromLocation();

    vi.advanceTimersByTime(utm.UTM_ATTRIBUTION_TTL_MS + 1);

    expect(utm.loadPersistedUtmAttribution()).toEqual({});
  });

  it('falls back to in-memory attribution when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const utm = await loadModule();
    land('?utm_source=fb&utm_campaign=tey26');

    utm.captureAndPersistUtmFromLocation();

    expect(utm.loadPersistedUtmAttribution()).toEqual({ utmSource: 'fb', utmCampaign: 'tey26' });
  });

  it('ignores tampered stored values', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ attribution: { utmSource: 'bad\nvalue' }, capturedAt: Date.now() }),
    );

    expect((await loadModule()).loadPersistedUtmAttribution()).toEqual({});
  });

  it('migrates the legacy tab-scoped value', async () => {
    sessionStorage.setItem(LEGACY_KEY, JSON.stringify({ utmSource: 'fb' }));

    expect((await loadModule()).loadPersistedUtmAttribution()).toEqual({ utmSource: 'fb' });
    expect(sessionStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});
