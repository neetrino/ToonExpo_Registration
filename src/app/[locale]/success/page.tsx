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
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-16">
      <div className="success-card-enter w-full max-w-md">
        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-border/80 bg-card px-6 py-10 text-center shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:px-8 md:py-12"
        >
          <div
            className="success-check-enter flex size-20 items-center justify-center rounded-full bg-success/15 md:size-24"
            aria-hidden="true"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-success md:size-16">
              <svg
                viewBox="0 0 24 24"
                className="size-8 text-white md:size-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5 9.5 17 19 7.5" />
              </svg>
            </div>
          </div>

          <h1 className="mt-6 font-display text-2xl font-extrabold text-primary md:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
            {t('description')}
          </p>

          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link href="/">{t('backToHome')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
