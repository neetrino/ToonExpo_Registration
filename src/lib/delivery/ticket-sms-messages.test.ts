import { describe, expect, it } from 'vitest';
import { buildTicketSmsMessage } from '@/lib/delivery/ticket-sms-messages';
import { buildHostedTicketUrl } from '@/lib/tickets/hosted-ticket-url';
import { generateTicketViewToken } from '@/lib/tickets/codes';

const PRODUCTION_ORIGIN = 'https://reg.toonexpo.com';
const LEGACY_TOKEN = 'HGLiaUBpicse_hCY72ECMO_uoN0xiyq_kDcsZ1rUfFc';

describe('buildTicketSmsMessage', () => {
  it('uses Armenian copy in one UCS-2 segment for a new ticket link', () => {
    const ticketUrl = buildHostedTicketUrl(PRODUCTION_ORIGIN, generateTicketViewToken());
    const text = buildTicketSmsMessage('hy', { ticketUrl });

    expect(text).toBe(`TOON EXPO տոմս՝ ${ticketUrl}`);
    expect(text.length).toBeLessThanOrEqual(70);
  });

  it('uses short Russian copy in one UCS-2 segment for a new ticket link', () => {
    const ticketUrl = buildHostedTicketUrl(PRODUCTION_ORIGIN, generateTicketViewToken());
    const text = buildTicketSmsMessage('ru', { ticketUrl });

    expect(text).toBe(`Билет: ${ticketUrl}`);
    expect(text.length).toBeLessThanOrEqual(70);
  });

  it('keeps English copy in one GSM-7 segment', () => {
    const ticketUrl = buildHostedTicketUrl(PRODUCTION_ORIGIN, generateTicketViewToken());
    const text = buildTicketSmsMessage('en', { ticketUrl });

    expect(text).toBe(`TOON EXPO ticket: ${ticketUrl}`);
    expect(text.length).toBeLessThanOrEqual(160);
  });

  it('falls back to Latin for a legacy 43-character token so resend stays one SMS', () => {
    expect(LEGACY_TOKEN).toHaveLength(43);
    const ticketUrl = buildHostedTicketUrl(PRODUCTION_ORIGIN, LEGACY_TOKEN);
    const text = buildTicketSmsMessage('hy', { ticketUrl });

    expect(text).toBe(`TOON EXPO ticket: ${ticketUrl}`);
    expect(text.length).toBeLessThanOrEqual(160);
    expect([...text].every((char) => char.charCodeAt(0) < 128)).toBe(true);
  });
});
