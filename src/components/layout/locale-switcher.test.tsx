import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

const { replace, localeRef, pathnameRef } = vi.hoisted(() => ({
  replace: vi.fn(),
  localeRef: { current: 'hy' },
  pathnameRef: { current: '/' },
}));

vi.mock('next-intl', () => ({
  useLocale: () => localeRef.current,
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace }),
}));

function setLocation(pathname: string, search = '') {
  window.history.replaceState({}, '', `${pathname}${search}`);
}

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replace.mockReset();
    localeRef.current = 'hy';
    pathnameRef.current = '/';
    setLocation('/hy');
  });

  it('keeps UTM params when the locale changes', () => {
    setLocation('/hy', '?utm_source=facebook&utm_medium=cpc&utm_campaign=tey26');
    render(<LocaleSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      {
        pathname: '/',
        query: {
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'tey26',
        },
      },
      { locale: 'en' },
    );
  });

  it('keeps the query on nested routes', () => {
    localeRef.current = 'en';
    pathnameRef.current = '/privacy';
    setLocation('/en/privacy', '?utm_source=instagram');
    render(<LocaleSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'RU' }));

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: '/privacy',
        query: { utm_source: 'instagram' },
      },
      { locale: 'ru' },
    );
  });

  it('switches locale without a query when the URL has none', () => {
    render(<LocaleSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'RU' }));

    expect(replace).toHaveBeenCalledWith('/', { locale: 'ru' });
  });

  it('does not navigate when the active locale is selected again', () => {
    setLocation('/hy', '?utm_source=facebook');
    render(<LocaleSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'HY' }));

    expect(replace).not.toHaveBeenCalled();
  });
});
