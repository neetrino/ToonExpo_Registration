import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingBrand } from '@/components/landing/landing-brand';
import { LandingRegistrationCard } from '@/components/landing/landing-registration-card';
import { SiteFooter } from '@/components/layout/site-footer';
import { locales, type Locale } from '@/types/locale';

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'hy';

  return (
    <div className="flex min-h-full flex-1 flex-col bg-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-4 py-10 md:gap-10 md:py-14 lg:py-16">
        <LandingBrand title={t('title')} tagline={t('description')} />
        <LandingRegistrationCard locale={resolvedLocale} />
      </div>
      <SiteFooter privacyLabel={t('privacyLink')} />
    </div>
  );
}
