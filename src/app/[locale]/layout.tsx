import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { SiteHeader } from '@/components/layout/site-header';
import { routing } from '@/i18n/routing';
import { resolveGtmContainerId } from '@/lib/analytics/gtm';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const gtmContainerId = resolveGtmContainerId();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {gtmContainerId ? <GoogleTagManager containerId={gtmContainerId} /> : null}
      <div className="flex min-h-dvh flex-col bg-primary">
        <SiteHeader />
        <main className="flex flex-1 flex-col bg-primary">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
