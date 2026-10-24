import {
  captureUtmFromSearchParams,
  compactUtmAttribution,
  hasUtmAttribution,
  mergeUtmAttribution,
  normalizeUtmValue,
  type UtmAttribution,
} from '@/lib/attribution';

const UTM_STORAGE_KEY = 'toon-expo-registration-utm-v2';
const LEGACY_UTM_SESSION_KEY = 'toon-expo-registration-utm-v1';

/** Attribution window: a captured campaign stays valid this long after its last landing. */
export const UTM_ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type UtmAttributionRecord = {
  attribution: UtmAttribution;
  capturedAt: number;
};

/** Page-lifetime copy so attribution survives when Web Storage is unavailable. */
let memoryRecord: UtmAttributionRecord | null = null;

function sanitizeAttribution(value: unknown): UtmAttribution {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  const read = (key: keyof UtmAttribution): string | undefined => {
    const field = record[key];
    return typeof field === 'string' ? normalizeUtmValue(field) : undefined;
  };

  return compactUtmAttribution({
    utmSource: read('utmSource'),
    utmMedium: read('utmMedium'),
    utmCampaign: read('utmCampaign'),
  });
}

function parseRecord(raw: string | null): UtmAttributionRecord | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const { attribution, capturedAt } = parsed as Record<string, unknown>;
    const sanitized = sanitizeAttribution(attribution);
    if (typeof capturedAt !== 'number' || !hasUtmAttribution(sanitized)) {
      return null;
    }

    return { attribution: sanitized, capturedAt };
  } catch {
    return null;
  }
}

/** One-time move of the pre-v2 tab-scoped value so in-flight visits keep their source. */
function migrateLegacyRecord(): UtmAttributionRecord | null {
  try {
    const raw = window.sessionStorage.getItem(LEGACY_UTM_SESSION_KEY);
    if (!raw) {
      return null;
    }

    window.sessionStorage.removeItem(LEGACY_UTM_SESSION_KEY);
    const attribution = sanitizeAttribution(JSON.parse(raw));
    if (!hasUtmAttribution(attribution)) {
      return null;
    }

    const record = { attribution, capturedAt: Date.now() };
    writeRecord(record);
    return record;
  } catch {
    return null;
  }
}

function readStoredRecord(): UtmAttributionRecord | null {
  try {
    return parseRecord(window.localStorage.getItem(UTM_STORAGE_KEY)) ?? migrateLegacyRecord();
  } catch {
    return null;
  }
}

function writeRecord(record: UtmAttributionRecord): void {
  memoryRecord = record;

  try {
    window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked or full: the in-memory copy still reaches this page's submit.
  }
}

function latestRecord(
  a: UtmAttributionRecord | null,
  b: UtmAttributionRecord | null,
): UtmAttributionRecord | null {
  if (!a || !b) {
    return a ?? b;
  }

  return a.capturedAt >= b.capturedAt ? a : b;
}

/**
 * Current UTM attribution for this visitor: the latest campaign landing
 * within `UTM_ATTRIBUTION_TTL_MS`, from localStorage or the in-memory fallback.
 */
export function loadPersistedUtmAttribution(): UtmAttribution {
  if (typeof window === 'undefined') {
    return {};
  }

  const record = latestRecord(readStoredRecord(), memoryRecord);
  if (!record || Date.now() - record.capturedAt > UTM_ATTRIBUTION_TTL_MS) {
    return {};
  }

  return record.attribution;
}

/**
 * Capture UTM from the current URL (last non-direct touch).
 * A landing with UTM replaces the stored campaign and restarts the window;
 * a landing without UTM keeps the stored campaign.
 */
export function captureAndPersistUtmFromLocation(): UtmAttribution {
  if (typeof window === 'undefined') {
    return {};
  }

  const fromUrl = captureUtmFromSearchParams(new URLSearchParams(window.location.search));
  const merged = mergeUtmAttribution(loadPersistedUtmAttribution(), fromUrl);

  if (hasUtmAttribution(fromUrl)) {
    writeRecord({ attribution: merged, capturedAt: Date.now() });
  }

  return merged;
}
