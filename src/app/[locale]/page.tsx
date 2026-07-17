import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{t('eyebrow')}</p>
        <h1 className="text-4xl font-bold text-primary">{t('title')}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t('description')}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-card-foreground">{t('eventDetailsTitle')}</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">{t('dateLabel')}</dt>
            <dd>{t('dateValue')}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t('venueLabel')}</dt>
            <dd>{t('venueValue')}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-muted p-6">
        <h2 className="text-xl font-semibold text-foreground">{t('registrationTitle')}</h2>
        <p className="mt-2 text-muted-foreground">{t('registrationPlaceholder')}</p>
        <div className="mt-6">
          <Button type="button" disabled>
            {t('registerCta')}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <Link href="/privacy" className="text-secondary underline-offset-4 hover:underline">
          {t('privacyLink')}
        </Link>
      </p>
    </section>
  );
}
