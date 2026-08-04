import {
  captureUtmFromSearchParams,
  compactUtmAttribution,
  hasUtmAttribution,
  mergeUtmAttribution,
  type UtmAttribution,
} from '@/lib/attribution';

const UTM_STORAGE_KEY = 'toon-expo-registration-utm-v1';

function isStoredAttribution(value: unknown): value is UtmAttribution {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  for (const key of ['utmSource', 'utmMedium', 'utmCampaign'] as const) {
    const field = record[key];
    if (field !== undefined && typeof field !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Load previously captured UTM attribution from sessionStorage.
 */
export function loadPersistedUtmAttribution(): UtmAttribution {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredAttribution(parsed)) {
      return {};
    }

    return compactUtmAttribution(parsed);
  } catch {
    return {};
  }
}

function savePersistedUtmAttribution(attribution: UtmAttribution): void {
  if (typeof window === 'undefined') {
    return;
  }

  const compact = compactUtmAttribution(attribution);
  if (!hasUtmAttribution(compact)) {
    return;
  }

  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(compact));
  } catch {
    // Ignore quota / private mode failures.
  }
}

/**
 * Capture UTM from the current URL and merge into sessionStorage.
 * First non-empty value per field wins across navigations within the tab.
 */
export function captureAndPersistUtmFromLocation(): UtmAttribution {
  if (typeof window === 'undefined') {
    return {};
  }

  const fromUrl = captureUtmFromSearchParams(new URLSearchParams(window.location.search));
  const existing = loadPersistedUtmAttribution();
  // Existing stored values win so later empty/absent URL params do not clear them;
  // first non-empty capture still wins when existing is empty for a field.
  const merged = mergeUtmAttribution(existing, fromUrl);
  savePersistedUtmAttribution(merged);
  return merged;
}

export function clearPersistedUtmAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
