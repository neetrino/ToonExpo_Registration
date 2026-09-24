import { describe, expect, it } from 'vitest';
import { buildTicketSmsMessage } from '@/lib/delivery/ticket-sms-messages';
import { buildHostedTicketUrl } from '@/lib/tickets/hosted-ticket-url';
import { generateTicketViewToken } from '@/lib/tickets/codes';
import { locales } from '@/types/locale';

const PRODUCTION_ORIGIN = 'https://reg.toonexpo.com';
const LEGACY_TOKEN = 'HGLiaUBpicse_hCY72ECMO_uoN0xiyq_kDcsZ1rUfFc';

const TICKET_WORD = {
  hy: 'Toms',
  en: 'Ticket',
  ru: 'Bilet',
} as const;

function productionTicketUrl(token = generateTicketViewToken()): string {
  return buildHostedTicketUrl(PRODUCTION_ORIGIN, token);
}

describe('buildTicketSmsMessage', () => {
  it.each(locales)('uses Latin GSM-7 copy for %s', (locale) => {
    const ticketUrl = productionTicketUrl();
    const text = buildTicketSmsMessage(locale, { ticketUrl });

    expect(text).toBe(`TOON EXPO ${TICKET_WORD[locale]}: ${ticketUrl}`);
    expect(text).not.toMatch(/[Ա-ֆА-яЁё]/);
    expect([...text].every((char) => char.charCodeAt(0) < 128)).toBe(true);
    expect(text.length).toBeLessThanOrEqual(160);
  });

  it('uses Toms for Armenian and Ticket for English', () => {
    const ticketUrl = productionTicketUrl();

    expect(buildTicketSmsMessage('hy', { ticketUrl })).toBe(`TOON EXPO Toms: ${ticketUrl}`);
    expect(buildTicketSmsMessage('en', { ticketUrl })).toBe(`TOON EXPO Ticket: ${ticketUrl}`);
  });

  it('keeps a legacy 43-character token in one GSM-7 SMS', () => {
    expect(LEGACY_TOKEN).toHaveLength(43);
    const ticketUrl = productionTicketUrl(LEGACY_TOKEN);
    const text = buildTicketSmsMessage('hy', { ticketUrl });

    expect(text).toBe(`TOON EXPO Toms: ${ticketUrl}`);
    expect(text.length).toBeLessThanOrEqual(160);
    expect([...text].every((char) => char.charCodeAt(0) < 128)).toBe(true);
  });
});
