import { describe, expect, it } from 'vitest';
import {
  formatAdminDateTime,
  formatAdminDateTimeForCsv,
  formatAdminDateTimeShort,
} from '@/lib/admin/format-datetime';

const voskehatyRegisteredAt = '2026-09-09T13:01:01.898Z';

describe('formatAdminDateTimeForCsv', () => {
  it('converts a UTC instant to Yerevan wall time', () => {
    expect(formatAdminDateTimeForCsv(voskehatyRegisteredAt)).toBe('2026-09-09 17:01:01');
  });

  it('rolls the calendar date when Yerevan is already the next day', () => {
    expect(formatAdminDateTimeForCsv('2026-09-09T21:00:00.000Z')).toBe('2026-09-10 01:00:00');
  });
});

describe('formatAdminDateTime', () => {
  it('shows the same Yerevan hour as the CSV export', () => {
    expect(formatAdminDateTime(voskehatyRegisteredAt)).toContain('17:01');
  });
});

describe('formatAdminDateTimeShort', () => {
  it('shows the Yerevan hour in the compact list format', () => {
    expect(formatAdminDateTimeShort(voskehatyRegisteredAt)).toContain('17:01');
  });
});
