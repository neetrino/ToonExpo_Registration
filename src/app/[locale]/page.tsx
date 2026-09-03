import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingBrand } from '@/components/landing/landing-brand';
import { LandingInfoDetails } from '@/components/landing/landing-info-details';
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
  const paragraphs = t.raw('paragraphs') as string[];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-primary">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-4 py-8 sm:gap-12 sm:py-10 md:py-14">
        <LandingBrand
          title={t('title')}
          titleBrand={t('titleBrand')}
          titleEvent={t('titleEvent')}
          meta={[
            { label: t('dateLabel'), value: t('dateValue') },
            { label: t('hoursLabel'), value: t('hoursValue') },
            { label: t('venueLabel'), value: t('venueValue') },
          ]}
        />

        <LandingRegistrationCard locale={resolvedLocale} />

        <LandingInfoDetails aboutToggle={t('aboutToggle')} paragraphs={paragraphs} />
      </div>
      <SiteFooter privacyLabel={t('privacyLink')} />
    </div>
  );
}
