'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ToonExpoLogo } from '@/components/brand/toon-expo-logo';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { scrollToSection } from '@/components/layout/scroll-to-section';

export function SiteHeader() {
  const t = useTranslations('common');

  return (
    <header className="border-b border-white/10 bg-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <ToonExpoLogo
            size={36}
            inverted
            priority
            className="shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="truncate font-display text-base font-bold tracking-tight text-white sm:text-lg">
            {t('siteName')}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderRegistrationLink label={t('registration')} />
          <LocaleSwitcher tone="inverse" />
        </div>
      </div>
    </header>
  );
}

function HeaderRegistrationLink({ label }: { label: string }) {
  const pathname = usePathname();
  if (pathname !== '/rf') {
    return null;
  }

  return (
    <Link
      href={{ pathname: '/rf', hash: 'registration' }}
      onClick={(event) => scrollToSection(event, 'registration')}
      className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-cta px-3 text-xs font-semibold text-white transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:px-4 sm:text-sm"
    >
      {label}
    </Link>
  );
}
