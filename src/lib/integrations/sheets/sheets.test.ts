import { describe, expect, it } from 'vitest';
import { assertSheetsWebhookOk } from '@/lib/integrations/sheets/client';
import { isAllowedSheetsWebhookUrl } from '@/lib/integrations/sheets/config';
import { sanitizeSheetCell, toSheetsRow } from '@/lib/integrations/sheets/map-row';

describe('isAllowedSheetsWebhookUrl', () => {
  it('allows script.google.com https URLs', () => {
    expect(
      isAllowedSheetsWebhookUrl('https://script.google.com/macros/s/abc/exec'),
    ).toBe(true);
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
  it('maps a general registration onto the General tab', () => {
    const row = toSheetsRow({
      id: 'reg_1',
      createdAt: new Date('2026-09-16T12:00:00.000Z'),
      firstName: 'Ani',
      lastName: 'Sargsyan',
      email: 'ani@example.com',
      phone: '+37499123456',
      locale: 'hy',
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
        ageBand: '25_34',
        visitPurpose: 'own_residence',
      },
    });

    expect(row.channel).toBe('GENERAL');
    expect(row.tab).toBe('General');
    expect(row.headers[0]).toBe('Registration ID');
    expect(row.values[0]).toBe('reg_1');
    expect(row.values[2]).toBe('Ani');
    expect(row.values.length).toBe(row.headers.length);
  });
});
