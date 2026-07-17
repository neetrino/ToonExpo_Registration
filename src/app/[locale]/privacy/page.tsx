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
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-16">
      <div className="landing-card-enter w-full max-w-2xl">
        <article className="rounded-2xl border border-border/80 bg-card px-6 py-8 shadow-[0_8px_32px_rgba(0,48,61,0.12)] md:px-10 md:py-10">
          <header className="flex flex-col items-start gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:gap-5">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/15"
              aria-hidden="true"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 4.5 6.5v5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5v-5L12 3Z" />
                  <path d="M9.5 12.2 11.2 14l3.5-3.8" />
                </svg>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                {t('status')}
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-primary md:text-3xl">
                {t('title')}
              </h1>
            </div>
          </header>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>{t('placeholder')}</p>
            <div className="rounded-xl border border-highlight/40 bg-highlight/10 px-4 py-3 text-sm leading-relaxed text-foreground">
              {t('notice')}
            </div>
          </div>

          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
