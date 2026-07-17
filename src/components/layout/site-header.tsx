'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          {t('siteName')}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            {t('privacy')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
