import { describe, expect, it } from 'vitest';
import { buildTicketEmailMessage } from '@/lib/delivery/ticket-email-messages';
import { TICKET_QR_CONTENT_ID } from '@/lib/delivery/constants';
import { locales } from '@/types/locale';

const sampleInput = {
  firstName: 'Ani',
  lastName: 'Petrosyan',
  ticketCode: 'TE7K4M2X9P3R8',
  ticketUrl: 'https://example.com/ticket/token',
  siteUrl: 'https://example.com',
};

describe('buildTicketEmailMessage', () => {
  it.each(locales)('returns non-empty subject and ticket fields for %s', (locale) => {
    const message = buildTicketEmailMessage(locale, sampleInput);

    expect(message.subject.trim().length).toBeGreaterThan(0);
    expect(message.text).toContain(`${sampleInput.firstName} ${sampleInput.lastName}`);
    expect(message.text).toContain(sampleInput.ticketCode);
    expect(message.text).toContain(sampleInput.ticketUrl);
    expect(message.html).toContain(`cid:${TICKET_QR_CONTENT_ID}`);
    expect(message.html).toContain(sampleInput.ticketCode);
    expect(message.html).toContain('https://yandex.com/maps/-/CThIYFMT');
    expect(message.html).toContain('mailto:hi@mail.toonexpo.com');
    expect(message.html).not.toContain('bgcolor="#00303d"');
    expect(message.text).toContain('11:00–21:00');
  });

  it('uses the approved Armenian subject and confirmation copy', () => {
    const message = buildTicketEmailMessage('hy', sampleInput);

    expect(message.subject).toBe('TOON EXPO - Ձեր գրանցումը հաստատված է');
    expect(message.text).toContain('Հարգելի Ani Petrosyan,');
    expect(message.text).toContain('Նոյեմբերի 13 | 14 | 15');
    expect(message.html).toContain('ապաբաժանորդագրվել');
  });

  it('uses Russian copy when the visitor selected Russian', () => {
    const message = buildTicketEmailMessage('ru', sampleInput);

    expect(message.subject).toBe('TOON EXPO - Ваша регистрация подтверждена');
    expect(message.text).toContain('Здравствуйте, Ani Petrosyan,');
    expect(message.text).toContain('Ваша регистрация подтверждена.');
    expect(message.html).toContain('Ваш QR-код для входа');
    expect(message.text).not.toContain('Հարգելի');
    expect(message.text).not.toContain('Ձեր գրանցումը հաստատված է');
    expect(message.html).not.toContain('Հարգելի');
    expect(message.html).not.toContain('ապաբաժանորդագրվել');
  });

  it('uses English copy when the visitor selected English', () => {
    const message = buildTicketEmailMessage('en', sampleInput);

    expect(message.subject).toBe('TOON EXPO - Your registration is confirmed');
    expect(message.text).toContain('Dear Ani Petrosyan,');
    expect(message.text).not.toContain('Հարգելի');
    expect(message.html).not.toContain('Ձեր գրանցումը հաստատված է');
  });

  it('escapes HTML in firstName and URLs in attributes', () => {
    const payload = `<script>alert(1)</script>"'`;
    const message = buildTicketEmailMessage('en', {
      firstName: payload,
      lastName: 'Petrosyan',
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
