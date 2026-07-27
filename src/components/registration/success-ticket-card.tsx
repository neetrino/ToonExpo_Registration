'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { isValidTicketCode } from '@/lib/tickets/ticket-code-format';
import { takeTicketHandoff, type TicketHandoff } from '@/components/registration/ticket-handoff';

type SuccessTicketCardProps = {
  locale: string;
};

/**
 * Client ticket preview on the success page.
 * Reads a one-shot sessionStorage handoff so tokens never appear in the URL.
 */
export function SuccessTicketCard({ locale }: SuccessTicketCardProps) {
  const t = useTranslations('success');
  const [handoff, setHandoff] = useState<TicketHandoff | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHandoff(takeTicketHandoff());
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  const hasTicket =
    handoff !== null &&
    isValidTicketCode(handoff.ticketCode) &&
    handoff.ticketViewToken.length >= 20;

  if (!hasTicket || !handoff) {
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

  const qrSrc = `/ticket/${encodeURIComponent(handoff.ticketViewToken)}/qr.png`;
  const ticketHref = `/ticket/${encodeURIComponent(handoff.ticketViewToken)}`;

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

      <p className="mt-4 font-mono text-lg font-semibold tracking-wider text-primary">
        {handoff.ticketCode}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t('codeHint')}</p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <a href={ticketHref} hrefLang={locale}>
            {t('openTicket')}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={qrSrc} download={`toon-expo-ticket-${handoff.ticketCode}.png`}>
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
