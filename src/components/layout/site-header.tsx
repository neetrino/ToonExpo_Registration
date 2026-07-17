'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          {t('siteName')}
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            {t('privacy')}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
