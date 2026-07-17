'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/types/locale';
import { cn } from '@/lib/utils';

const localeLabels: Record<Locale, string> = {
  hy: 'HY',
  en: 'EN',
  ru: 'RU',
};

export function LocaleSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-border p-1"
      role="group"
      aria-label={t('languageSwitcher')}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          aria-current={code === locale ? 'true' : undefined}
          className={cn(
            'min-h-9 min-w-9 rounded px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            code === locale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          onClick={() => handleChange(code)}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
