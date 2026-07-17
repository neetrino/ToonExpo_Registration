import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EventDetails } from '@/components/landing/event-details';
import { LandingHero } from '@/components/landing/landing-hero';
import { RegistrationSection } from '@/components/landing/registration-section';
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
    <>
      <LandingHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        ctaLabel={t('registerCta')}
      />
      <EventDetails
        title={t('eventDetailsTitle')}
        dateLabel={t('dateLabel')}
        dateValue={t('dateValue')}
        venueLabel={t('venueLabel')}
        venueValue={t('venueValue')}
      />
      <RegistrationSection
        locale={resolvedLocale}
        title={t('registrationTitle')}
        description={t('registrationDescription')}
      />
      <SiteFooter privacyLabel={t('privacyLink')} />
    </>
  );
}
