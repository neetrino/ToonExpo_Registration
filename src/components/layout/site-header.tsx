'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="border-b border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-highlight text-sm font-bold text-primary transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            T
          </span>
          <span className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
            {t('siteName')}
          </span>
        </Link>
        <LocaleSwitcher tone="inverse" />
      </div>
    </header>
  );
}
