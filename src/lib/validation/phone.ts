import {
  getCountryCallingCode,
  Metadata,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, PHONE_MAX_LENGTH } from '@/lib/validation/constants';

export type NormalizedPhone = {
  phone: string;
  phoneNormalized: string;
};

const NATIONAL_PHONE_DIGIT_LIMITS = new Map<CountryCode, number>();
const NATIONAL_DIGIT_GROUPS = new Map<CountryCode, readonly number[]>();

/**
 * Digits typed after the country code.
 * Russian metadata also lists 14; a visitor mobile is 10 (`+7` + `9993005512`).
 */
const VISITOR_NATIONAL_LENGTH: Partial<Record<CountryCode, number>> = {
  RU: 10,
};

/** Keep only ASCII digits so the local number field cannot accept letters or symbols. */
export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * National digit count the visitor types for this country.
 */
export function nationalPhoneDigitLimit(country: CountryCode): number {
  const visitorLength = VISITOR_NATIONAL_LENGTH[country];
  if (visitorLength !== undefined) {
    return visitorLength;
  }

  const cached = NATIONAL_PHONE_DIGIT_LIMITS.get(country);
  if (cached !== undefined) {
    return cached;
  }

  const metadata = new Metadata();
  metadata.selectNumberingPlan(country);
  const lengths = metadata.numberingPlan?.possibleLengths() ?? [];
  const limit = lengths.length > 0 ? Math.max(...lengths) : PHONE_MAX_LENGTH;
  NATIONAL_PHONE_DIGIT_LIMITS.set(country, limit);
  return limit;
}

/** Local number with the area or operator code in parentheses and the rest dashed. */
export function formatNationalPhoneInput(digits: string, country: CountryCode): string {
  if (digits.length === 0) {
    return '';
  }

  return applyDigitGroups(digits, nationalDigitGroups(country));
}

/** Example shown beside an invalid-phone error. */
export function nationalPhoneExample(country: CountryCode): string {
  const callingCode = getCountryCallingCode(country);
  if (country === 'RU') {
    return `+${callingCode} (965) 300-55-12`;
  }

  return `+${callingCode} ${nationalPhonePlaceholder(country)}`;
}

/** Placeholder mask: first group in parentheses, remaining groups separated by dashes. */
export function nationalPhonePlaceholder(country: CountryCode): string {
  const groups = nationalDigitGroups(country);
  return applyDigitGroups('X'.repeat(groups.reduce((sum, size) => sum + size, 0)), groups);
}

function nationalDigitGroups(country: CountryCode): readonly number[] {
  const cached = NATIONAL_DIGIT_GROUPS.get(country);
  if (cached) {
    return cached;
  }

  const limit = nationalPhoneDigitLimit(country);
  const metadata = new Metadata();
  metadata.selectNumberingPlan(country);
  const candidates = (metadata.numberingPlan?.formats() ?? [])
    .map((format) => fixedDigitGroups(String(format.pattern())))
    .filter((groups): groups is number[] => groups !== null && sum(groups) === limit)
    .map((groups) => dashLongGroups(groups));

  const groups = candidates.sort(compareDigitGroups)[0] ?? dashLongGroups(chunkDigits(limit, 3));
  NATIONAL_DIGIT_GROUPS.set(country, groups);
  return groups;
}

function fixedDigitGroups(pattern: string): number[] | null {
  const sizes = [...pattern.matchAll(/\\d\{(\d+)\}/g)].map((match) => Number(match[1]));
  if (sizes.length === 0 || sizes.some((size) => !Number.isInteger(size) || size < 1)) {
    return null;
  }

  return sizes;
}

/** Keep area codes intact and split a long subscriber tail into pairs so dashes stay readable. */
function dashLongGroups(groups: readonly number[]): number[] {
  const [first, ...rest] = groups;
  if (first === undefined) {
    return [];
  }

  return [first, ...rest.flatMap(pairFromRight)];
}

function pairFromRight(size: number): number[] {
  if (size <= 4) {
    return [size];
  }

  const chunks: number[] = [];
  let remaining = size;
  while (remaining > 2) {
    chunks.unshift(2);
    remaining -= 2;
  }
  if (remaining > 0) {
    chunks.unshift(remaining);
  }
  if (chunks[0] === 1 && chunks.length > 1) {
    const next = chunks[1] ?? 0;
    chunks.splice(0, 2, next + 1);
  }

  return chunks;
}

function chunkDigits(length: number, size: number): number[] {
  const groups: number[] = [];
  let remaining = length;
  while (remaining > 0) {
    const take = Math.min(size, remaining);
    groups.push(take);
    remaining -= take;
  }

  return groups.length > 0 ? groups : [length];
}

function compareDigitGroups(left: readonly number[], right: readonly number[]): number {
  const groupScore = (groups: readonly number[]) => groups.length * 100 + areaCodeScore(groups[0] ?? 0);
  return groupScore(right) - groupScore(left);
}

function areaCodeScore(size: number): number {
  return size >= 2 && size <= 3 ? size : 0;
}

function sum(groups: readonly number[]): number {
  return groups.reduce((total, size) => total + size, 0);
}

function applyDigitGroups(digits: string, groups: readonly number[]): string {
  const parts: string[] = [];
  let offset = 0;
  for (const size of groups) {
    if (offset >= digits.length) {
      break;
    }
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }

  const [area, ...rest] = parts;
  if (!area) {
    return '';
  }
  if (area.length < (groups[0] ?? area.length)) {
    return `(${area}`;
  }
  if (rest.length === 0) {
    return `(${area})`;
  }

  return `(${area}) ${rest.join('-')}`;
}

/**
 * Next stored digits after a keystroke.
 * Backspace on a parenthesis or dash still removes a digit.
 */
export function nextNationalPhoneDigits(
  rawValue: string,
  previousDigits: string,
  country: CountryCode,
): string {
  const nextDigits = nationalPhoneInput(rawValue, country);
  const formatted = formatNationalPhoneInput(previousDigits, country);
  const deletedFormatting = nextDigits === previousDigits && rawValue.length < formatted.length;
  if (deletedFormatting) {
    return previousDigits.slice(0, -1);
  }

  return nextDigits;
}

/** Digits-only local number, without a pasted country code, capped at the national length. */
export function nationalPhoneInput(value: string, country: CountryCode): string {
  const limit = nationalPhoneDigitLimit(country);
  const digits = stripCountryPrefix(digitsOnlyPhone(value), country, limit);
  return digits.slice(0, limit);
}

function stripCountryPrefix(digits: string, country: CountryCode, limit: number): string {
  const callingCode = String(getCountryCallingCode(country));
  if (digits.startsWith(callingCode) && digits.length === callingCode.length + limit) {
    return digits.slice(callingCode.length);
  }

  if (country === 'RU' && digits.startsWith('8') && digits.length === limit + 1) {
    return digits.slice(1);
  }

  return digits;
}

/**
 * Parse a phone number to E.164.
 * Uses `defaultCountry` when the input has no international prefix (e.g. local Armenian digits).
 */
export function normalizePhone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): NormalizedPhone | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > PHONE_MAX_LENGTH * 2) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return null;
  }

  const phoneNormalized = parsed.format('E.164');
  if (phoneNormalized.length > PHONE_MAX_LENGTH) {
    return null;
  }

  return {
    phone: parsed.formatInternational(),
    phoneNormalized,
  };
}
