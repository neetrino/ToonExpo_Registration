'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { EVENT_CALENDAR_URL, TELEGRAM_CHANNEL_URL } from '@/lib/brand/site';
import { isValidTicketCode } from '@/lib/tickets/ticket-code-format';
import { takeTicketHandoff, type TicketHandoff } from '@/components/registration/ticket-handoff';

/**
 * Client ticket preview on the success page.
 * Reads a one-shot sessionStorage handoff so tokens never appear in the URL.
 */
export function SuccessTicketCard() {
  const t = useTranslations('success');
  const [handoff, setHandoff] = useState<TicketHandoff | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // sessionStorage is client-only; read after mount to avoid SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate one-shot ticket handoff
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
        <h1 className="mt-3 font-display text-xl font-extrabold text-primary md:text-2xl">
          {t('title')}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
          {t('description')}
        </p>
        <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
          <Link href="/">{t('backToHome')}</Link>
        </Button>
      </>
    );
  }

  const qrSrc = `/ticket/${encodeURIComponent(handoff.ticketViewToken)}/qr.png`;

  return (
    <>
      <h1 className="mt-3 font-display text-xl font-extrabold text-primary md:text-2xl">
        {t('ticketTitle')}
      </h1>
      <p className="mt-1.5 max-w-sm text-sm leading-snug text-muted-foreground">
        {t('ticketDescription')}
      </p>
      <p className="mt-2 max-w-sm rounded-lg bg-muted px-3 py-1.5 text-xs leading-snug font-medium text-primary">
        {t('emailNotice')}
      </p>

      <div className="mt-3 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border/60">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic ticket QR PNG */}
        <img
          src={qrSrc}
          alt={t('qrAlt')}
          width={240}
          height={240}
          className="mx-auto size-36 md:size-44"
        />
      </div>

      <p className="mt-2 font-mono text-base font-semibold tracking-wider text-primary">
        {handoff.ticketCode}
      </p>
      <p className="text-xs text-muted-foreground">{t('codeHint')}</p>

      <div className="mt-3 grid w-full gap-2 sm:grid-cols-2 md:mt-4">
        <Button asChild>
          <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            {t('joinTelegram')}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={qrSrc} download={`toon-expo-ticket-${handoff.ticketCode}.png`}>
            {t('downloadQr')}
          </a>
        </Button>
        <Button asChild variant="outline" className="sm:col-span-2">
          <a href={EVENT_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
            {t('addToCalendar')}
          </a>
        </Button>
      </div>
    </>
  );
}
