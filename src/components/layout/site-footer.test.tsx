import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from '@/components/layout/site-footer';

vi.mock('next-intl/server', () => ({
  getTranslations: async () =>
    Object.assign((key: string) => key, {
      rich: (_key: string, values: { creator: (chunks: string) => ReactNode }) =>
        values.creator('Neetrino'),
    }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('SiteFooter', () => {
  it('links Neetrino with the production UTM source', async () => {
    render(await SiteFooter());

    const credit = screen.getByRole('link', { name: 'Neetrino' });
    expect(credit.getAttribute('href')).toBe('https://neetrino.com/?utm_source=reg.toonexpo.com');
    expect(credit.getAttribute('target')).toBe('_blank');
    expect(credit.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
