import { describe, expect, it } from 'vitest';
import { assertSheetsWebhookOk } from '@/lib/integrations/sheets/client';
import { isAllowedSheetsWebhookUrl } from '@/lib/integrations/sheets/config';
import {
  sanitizeSheetCell,
  toSheetsRow,
  type RegistrationForSheetRow,
} from '@/lib/integrations/sheets/map-row';
import type { Locale } from '@/generated/prisma';

function cellByHeader(
  row: { headers: readonly string[]; values: string[] },
  header: string,
): string {
  const index = row.headers.indexOf(header);
  expect(index).toBeGreaterThanOrEqual(0);
  return row.values[index] ?? '';
}

function generalRegistration(locale: Locale): RegistrationForSheetRow {
  return {
    id: 'reg_1',
    createdAt: new Date('2026-09-16T12:00:00.000Z'),
    firstName: 'Ani',
    lastName: 'Sargsyan',
    email: 'ani@example.com',
    phone: '+37499123456',
    locale,
    sourceSystem: 'TOON_EXPO',
    sourceRegistrationId: null,
    utmSource: 'fb',
    utmMedium: null,
    utmCampaign: null,
    ticketCode: 'TEABCDEFGHIJK',
    attendanceStatus: 'NOT_VISITED',
    emailDeliveryStatus: 'PENDING',
    formVersion: '2026-vis-reg-v2',
    formChannel: 'GENERAL',
    answers: {
      ageBand: '25-34',
      visitPurpose: 'own_residence',
      newsletter: true,
    },
  };
}

describe('isAllowedSheetsWebhookUrl', () => {
  it('allows script.google.com https URLs', () => {
    expect(isAllowedSheetsWebhookUrl('https://script.google.com/macros/s/abc/exec')).toBe(true);
  });

  it('rejects non-https and foreign hosts', () => {
    expect(isAllowedSheetsWebhookUrl('http://script.google.com/macros/s/abc/exec')).toBe(false);
    expect(isAllowedSheetsWebhookUrl('https://evil.example/macros/s/abc/exec')).toBe(false);
  });
});

describe('assertSheetsWebhookOk', () => {
  it('accepts { ok: true }', () => {
    expect(() => assertSheetsWebhookOk({ ok: true }, 200)).not.toThrow();
  });

  it('rejects error bodies even on HTTP 200', () => {
    expect(() => assertSheetsWebhookOk({ error: 'unauthorized' }, 200)).toThrow(
      'SHEETS_WEBHOOK_unauthorized',
    );
  });
});

describe('sanitizeSheetCell', () => {
  it('neutralizes formula prefixes', () => {
    expect(sanitizeSheetCell('=1+1')).toBe("'=1+1");
  });
});

describe('toSheetsRow', () => {
  it('maps a general registration with Armenian operator headers', () => {
    const row = toSheetsRow(generalRegistration('hy'));

    expect(row.channel).toBe('GENERAL');
    expect(row.tab).toBe('Ընդհանուր');
    expect(row.headers[0]).toBe('Գրանցման ID');
    expect(row.headers).toContain('Անուն');
    expect(row.headers).toContain('Տարիք');
    expect(row.headers).not.toContain('Քաղաք (ՌԴ)');
    expect(row.values[0]).toBe('reg_1');
    expect(row.values[2]).toBe('Ani');
    expect(cellByHeader(row, 'Լեզու')).toBe('Հայերեն');
    expect(cellByHeader(row, 'Այցելություն')).toBe('Չի այցելել');
    expect(row.values.length).toBe(row.headers.length);
  });

  it('writes questionnaire answers in the registration locale', () => {
    const hy = toSheetsRow(generalRegistration('hy'));
    const en = toSheetsRow(generalRegistration('en'));
    const ru = toSheetsRow(generalRegistration('ru'));

    expect(cellByHeader(hy, 'Այցի նպատակ')).toBe('Անշարժ գույքի գնում սեփական բնակության համար');
    expect(cellByHeader(hy, 'Տեղեկագիր')).toBe('Այո');

    expect(cellByHeader(en, 'Այցի նպատակ')).toBe('Purchasing real estate for personal residence');
    expect(cellByHeader(en, 'Տեղեկագիր')).toBe('Yes');
    expect(cellByHeader(en, 'Լեզու')).toBe('English');
    expect(cellByHeader(en, 'Այցելություն')).toBe('Չի այցելել');

    expect(cellByHeader(ru, 'Այցի նպատակ')).toBe('Покупка недвижимости для себя или семьи');
    expect(cellByHeader(ru, 'Տեղեկագիր')).toBe('Да');
  });
});
