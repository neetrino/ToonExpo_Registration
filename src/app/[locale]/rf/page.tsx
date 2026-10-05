import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingHowItWorks } from '@/components/landing/landing-how-it-works';
import { LandingInfoDetails } from '@/components/landing/landing-info-details';
import { LandingRegistrationCard } from '@/components/landing/landing-registration-card';
import { SiteFooter } from '@/components/layout/site-footer';
import { locales, type Locale } from '@/types/locale';

type SpyurkLandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SpyurkLandingPage({ params }: SpyurkLandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'hy';
  const paragraphs = t.raw('paragraphs') as string[];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LandingHero />
      <LandingHowItWorks />
      <div className="bg-primary">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4 py-10 sm:gap-12 sm:py-14">
          <LandingRegistrationCard locale={resolvedLocale} variant="spyurk" />
          <LandingInfoDetails aboutToggle={t('aboutToggle')} paragraphs={paragraphs} />
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
