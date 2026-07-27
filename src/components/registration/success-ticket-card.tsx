'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { isValidTicketCode } from '@/lib/tickets/ticket-code-format';

type SuccessTicketCardProps = {
  locale: string;
};

/**
 * Client ticket preview on the success page. Uses query params from registration redirect.
 */
export function SuccessTicketCard({ locale }: SuccessTicketCardProps) {
  const t = useTranslations('success');
  const searchParams = useSearchParams();
  const ticketCode = searchParams.get('code') ?? '';
  const ticketViewToken = searchParams.get('t') ?? '';
  const hasTicket = isValidTicketCode(ticketCode) && ticketViewToken.length >= 20;

  if (!hasTicket) {
    return (
      <>
        <h1 className="mt-6 font-display text-2xl font-extrabold text-primary md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
          {t('description')}
        </p>
        <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
          <Link href="/">{t('backToHome')}</Link>
        </Button>
      </>
    );
  }

  const qrSrc = `/ticket/${encodeURIComponent(ticketViewToken)}/qr.png`;
  const ticketHref = `/ticket/${encodeURIComponent(ticketViewToken)}`;

  return (
    <>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-primary md:text-3xl">
        {t('ticketTitle')}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
        {t('ticketDescription')}
      </p>

      <div className="mt-8 rounded-xl bg-white p-4 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic ticket QR PNG */}
        <img
          src={qrSrc}
          alt={t('qrAlt')}
          width={240}
          height={240}
          className="mx-auto size-60"
        />
      </div>

      <p className="mt-4 font-mono text-lg font-semibold tracking-wider text-primary">{ticketCode}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t('codeHint')}</p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <a href={ticketHref} hrefLang={locale}>
            {t('openTicket')}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={qrSrc} download={`toon-expo-ticket-${ticketCode}.png`}>
            {t('downloadQr')}
          </a>
        </Button>
      </div>

      <Button asChild variant="ghost" className="mt-4">
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </>
  );
}
