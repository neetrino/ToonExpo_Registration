import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('success');

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 md:py-24">
      <div className="border-l-4 border-highlight pl-5">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{t('title')}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t('description')}</p>
      </div>
      <Button asChild size="lg" className="w-fit">
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </section>
  );
}
