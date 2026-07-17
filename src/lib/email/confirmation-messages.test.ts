import { describe, expect, it } from 'vitest';
import { buildConfirmationMessage } from '@/lib/email/confirmation-messages';
import { locales } from '@/types/locale';

const sampleInput = {
  firstName: 'Ani',
  siteUrl: 'https://example.com',
};

describe('buildConfirmationMessage', () => {
  it.each(locales)('returns non-empty subject and body for %s', (locale) => {
    const message = buildConfirmationMessage(locale, sampleInput);

    expect(message.subject.trim().length).toBeGreaterThan(0);
    expect(message.text.trim().length).toBeGreaterThan(0);
    expect(message.html.trim().length).toBeGreaterThan(0);
    expect(message.text).toContain(sampleInput.firstName);
    expect(message.text).toContain(sampleInput.siteUrl);
  });

  it('escapes HTML and quote characters in firstName', () => {
    const payload = `<script>alert(1)</script>"'`;
    const message = buildConfirmationMessage('en', {
      firstName: payload,
      siteUrl: 'https://example.com',
    });

    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#39;');
    expect(message.text).toContain(payload);
  });
});
