import { describe, expect, it } from 'vitest';
import { buildTicketSmsMessage } from '@/lib/delivery/ticket-sms-messages';

describe('buildTicketSmsMessage', () => {
  const ticketUrl = 'https://reg.toonexpo.com/ticket/abc';

  it('builds English copy with the ticket URL', () => {
    expect(buildTicketSmsMessage('en', { ticketUrl })).toBe(
      'TOON EXPO ticket: https://reg.toonexpo.com/ticket/abc',
    );
  });

  it('builds Armenian and Russian copy with the ticket URL', () => {
    expect(buildTicketSmsMessage('hy', { ticketUrl })).toContain(ticketUrl);
    expect(buildTicketSmsMessage('ru', { ticketUrl })).toContain(ticketUrl);
  });
});
