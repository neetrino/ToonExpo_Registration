import { ADMIN_DISPLAY_TIMEZONE } from '@/lib/admin/constants';

const ADMIN_DATE_LOCALE = 'en-GB';

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}

/**
 * Operator-facing datetime in Armenia local time (admin list/detail).
 */
export function formatAdminDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat(ADMIN_DATE_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: ADMIN_DISPLAY_TIMEZONE,
  }).format(toDate(value));
}

/**
 * Compact operator-facing datetime in Armenia local time (admin list, narrow layout).
 */
export function formatAdminDateTimeShort(value: Date | string): string {
  return new Intl.DateTimeFormat(ADMIN_DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ADMIN_DISPLAY_TIMEZONE,
  }).format(toDate(value));
}

/**
 * Excel-friendly local timestamp for CSV export (same timezone as the admin UI).
 */
export function formatAdminDateTimeForCsv(value: Date | string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ADMIN_DISPLAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(toDate(value));

  return `${partValue(parts, 'year')}-${partValue(parts, 'month')}-${partValue(parts, 'day')} ${partValue(parts, 'hour')}:${partValue(parts, 'minute')}:${partValue(parts, 'second')}`;
}
