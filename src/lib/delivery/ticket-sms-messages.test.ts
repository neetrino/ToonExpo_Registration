import { describe, expect, it } from 'vitest';
import { buildTicketSmsMessage } from '@/lib/delivery/ticket-sms-messages';

/** GSM-7 basic set. Characters outside this set force UCS-2 and a second SMS. */
const GSM_7_BASIC = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
);

describe('buildTicketSmsMessage', () => {
  const ticketUrl =
    'https://reg.toonexpo.com/ticket/HGLiaUBpicse_hCY72ECMO_uoN0xiyq_kDcsZ1rUfFc';

  it('uses one GSM-7 message for every locale so the ticket URL stays a single SMS', () => {
    const expected = `TOON EXPO ticket: ${ticketUrl}`;

    for (const locale of ['hy', 'en', 'ru'] as const) {
      const text = buildTicketSmsMessage(locale, { ticketUrl });
      expect(text).toBe(expected);
      expect(text.length).toBeLessThanOrEqual(160);
      expect([...text].every((char) => GSM_7_BASIC.has(char))).toBe(true);
    }
  });
});
