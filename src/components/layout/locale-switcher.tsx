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

type LocaleSwitcherProps = {
  tone?: 'default' | 'inverse';
};

export function LocaleSwitcher({ tone = 'default' }: LocaleSwitcherProps) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const isInverse = tone === 'inverse';

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full p-0.5',
        isInverse ? 'border border-white/20 bg-white/5' : 'border border-border bg-background',
      )}
      role="group"
      aria-label={t('languageSwitcher')}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          aria-current={code === locale ? 'true' : undefined}
          className={cn(
            'min-h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 motion-reduce:transition-none',
            isInverse && 'focus-visible:ring-offset-primary',
            !isInverse && 'focus-visible:ring-offset-background',
            code === locale
              ? isInverse
                ? 'bg-white text-primary'
                : 'bg-primary text-primary-foreground'
              : isInverse
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
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
