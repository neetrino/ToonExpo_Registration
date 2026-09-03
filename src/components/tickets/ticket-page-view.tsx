import { ToonExpoLogo } from '@/components/brand/toon-expo-logo';

type TicketPageViewProps = {
  ticketCode: string;
  ticketViewToken: string;
  firstName: string;
  lastName: string;
  locale: string;
};

const COPY: Record<
  string,
  { title: string; subtitle: string; codeLabel: string; download: string }
> = {
  hy: {
    title: 'Ձեր տոմսը',
    subtitle: 'Պահեք այս QR կոդը միջոցառման մուտքի համար։',
    codeLabel: 'Կոդ',
    download: 'Ներբեռնել QR PNG',
  },
  en: {
    title: 'Your ticket',
    subtitle: 'Keep this QR code for event entry.',
    codeLabel: 'Code',
    download: 'Download QR PNG',
  },
  ru: {
    title: 'Ваш билет',
    subtitle: 'Сохраните этот QR-код для входа на мероприятие.',
    codeLabel: 'Код',
    download: 'Скачать QR PNG',
  },
};

/**
 * Hosted ticket presentation shared by private bearer links.
 */
export function TicketPageView({
  ticketCode,
  ticketViewToken,
  firstName,
  lastName,
  locale,
}: TicketPageViewProps) {
  const copy = COPY[locale] ?? COPY.en;
  const qrSrc = `/ticket/${encodeURIComponent(ticketViewToken)}/qr.png`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 py-10">
      <ToonExpoLogo size={72} alt="TOON Real Estate Expo" priority />
      <h1 className="mt-8 text-center font-display text-3xl font-extrabold tracking-tight">
        {copy.title}
      </h1>
      <p className="mt-2 text-center text-base text-[#00303d]/80">{copy.subtitle}</p>
      <p className="mt-4 text-center text-sm font-medium">
        {firstName} {lastName}
      </p>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-[0_8px_32px_rgba(0,48,61,0.12)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic ticket QR PNG */}
        <img src={qrSrc} alt="Ticket QR" width={280} height={280} className="size-[280px]" />
      </div>

      <p className="mt-6 text-sm uppercase tracking-wide text-[#00303d]/70">{copy.codeLabel}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{ticketCode}</p>

      <a
        href={qrSrc}
        download={`toon-expo-ticket-${ticketCode}.png`}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[#00303d] px-6 text-sm font-semibold text-white"
      >
        {copy.download}
      </a>
    </main>
  );
}
