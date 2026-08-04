/** Max length for stored / validated UTM field values. */
export const UTM_MAX_LENGTH = 128;

/**
 * Safe charset for analytics labels: alphanumeric plus common separators.
 * Rejects spaces and control characters.
 */
export const UTM_VALUE_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export type UtmAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const UTM_PARAM_KEYS = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
} as const;

/**
 * Trim and validate a raw UTM value. Empty or invalid → undefined (absent).
 */
export function normalizeUtmValue(raw: string | null | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > UTM_MAX_LENGTH) {
    return undefined;
  }

  if (!UTM_VALUE_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

/**
 * Read one query param with case-insensitive name matching.
 * First matching key wins when duplicates exist with different casing.
 */
export function getQueryParamCaseInsensitive(
  params: URLSearchParams,
  name: string,
): string | undefined {
  const target = name.toLowerCase();

  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === target) {
      return value;
    }
  }

  return undefined;
}

/**
 * Capture UTM attribution from URL search params.
 * Param names are matched case-insensitively; values are trimmed and validated.
 */
export function captureUtmFromSearchParams(params: URLSearchParams): UtmAttribution {
  const result: UtmAttribution = {};

  const source = normalizeUtmValue(getQueryParamCaseInsensitive(params, UTM_PARAM_KEYS.utmSource));
  const medium = normalizeUtmValue(getQueryParamCaseInsensitive(params, UTM_PARAM_KEYS.utmMedium));
  const campaign = normalizeUtmValue(
    getQueryParamCaseInsensitive(params, UTM_PARAM_KEYS.utmCampaign),
  );

  if (source) {
    result.utmSource = source;
  }
  if (medium) {
    result.utmMedium = medium;
  }
  if (campaign) {
    result.utmCampaign = campaign;
  }

  return result;
}

/**
 * Merge attribution: first non-empty value wins per field (do not overwrite with empty).
 */
export function mergeUtmAttribution(
  existing: UtmAttribution,
  incoming: UtmAttribution,
): UtmAttribution {
  return {
    utmSource: existing.utmSource ?? incoming.utmSource,
    utmMedium: existing.utmMedium ?? incoming.utmMedium,
    utmCampaign: existing.utmCampaign ?? incoming.utmCampaign,
  };
}

/**
 * Drop undefined keys so optional JSON payloads omit absent fields.
 */
export function compactUtmAttribution(attribution: UtmAttribution): UtmAttribution {
  const result: UtmAttribution = {};
  if (attribution.utmSource) {
    result.utmSource = attribution.utmSource;
  }
  if (attribution.utmMedium) {
    result.utmMedium = attribution.utmMedium;
  }
  if (attribution.utmCampaign) {
    result.utmCampaign = attribution.utmCampaign;
  }
  return result;
}

export function hasUtmAttribution(attribution: UtmAttribution): boolean {
  return Boolean(attribution.utmSource || attribution.utmMedium || attribution.utmCampaign);
}
