import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('privacy');

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {t('status')}
      </p>
      <div className="mt-8 space-y-4 border border-border bg-muted p-6 text-muted-foreground">
        <p>{t('placeholder')}</p>
        <p>{t('notice')}</p>
      </div>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </section>
  );
}
