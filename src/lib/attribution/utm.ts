/** Max length for stored / validated UTM field values. */
export const UTM_MAX_LENGTH = 128;

/**
 * Printable Unicode text (letters in any script, digits, spaces, `+`, punctuation).
 * Rejects control/format/line-separator characters and HTML angle brackets.
 * Apply to canonicalized values only (see `canonicalizeUtmValue`).
 */
export const UTM_VALUE_PATTERN = /^[^\p{C}\p{Zl}\p{Zp}<>]{1,128}$/u;

const UTM_SPACE_RUN_PATTERN = /\p{Zs}+/gu;

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
 * Canonical UTM text shared by client capture and server validation:
 * NFC-normalized, Unicode space runs collapsed to one space, trimmed.
 * Returns an empty string for blank input. Does not validate.
 */
export function canonicalizeUtmValue(raw: string): string {
  return raw.normalize('NFC').replace(UTM_SPACE_RUN_PATTERN, ' ').trim();
}

/**
 * Canonicalize and validate a raw UTM value. Empty or invalid → undefined (absent).
 * URL `+` is already decoded to a space by `URLSearchParams`.
 */
export function normalizeUtmValue(raw: string | null | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }

  const value = canonicalizeUtmValue(raw);
  if (!value || value.length > UTM_MAX_LENGTH || !UTM_VALUE_PATTERN.test(value)) {
    return undefined;
  }

  return value;
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
 * Last non-direct touch: a visit carrying any UTM replaces the whole set
 * (fields from different campaigns are never mixed); a visit without UTM keeps `existing`.
 */
export function mergeUtmAttribution(
  existing: UtmAttribution,
  incoming: UtmAttribution,
): UtmAttribution {
  const next = compactUtmAttribution(incoming);
  return hasUtmAttribution(next) ? next : compactUtmAttribution(existing);
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
