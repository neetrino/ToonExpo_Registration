import { describe, expect, it } from 'vitest';
import { buildTicketEmailMessage } from '@/lib/delivery/ticket-email-messages';
import { TICKET_QR_CONTENT_ID } from '@/lib/delivery/constants';
import { locales } from '@/types/locale';

const sampleInput = {
  firstName: 'Ani',
  ticketCode: 'TE7K4M2X9P3R8',
  ticketUrl: 'https://example.com/ticket/token',
  siteUrl: 'https://example.com',
};

describe('buildTicketEmailMessage', () => {
  it.each(locales)('returns non-empty subject and ticket fields for %s', (locale) => {
    const message = buildTicketEmailMessage(locale, sampleInput);

    expect(message.subject.trim().length).toBeGreaterThan(0);
    expect(message.text).toContain(sampleInput.firstName);
    expect(message.text).toContain(sampleInput.ticketCode);
    expect(message.text).toContain(sampleInput.ticketUrl);
    expect(message.html).toContain(`cid:${TICKET_QR_CONTENT_ID}`);
    expect(message.html).toContain(sampleInput.ticketCode);
  });

  it('escapes HTML in firstName and URLs in attributes', () => {
    const payload = `<script>alert(1)</script>"'`;
    const message = buildTicketEmailMessage('en', {
      firstName: payload,
      ticketCode: 'TE7K4M2X9P3R8',
      ticketUrl: 'https://example.com/ticket/"onclick',
      siteUrl: 'https://example.com',
    });

    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#39;');
    expect(message.html).toContain('https://example.com/ticket/&quot;onclick');
    expect(message.text).toContain(payload);
  });
});
