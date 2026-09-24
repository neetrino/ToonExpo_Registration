import type { Locale } from '@/types/locale';

export type TicketSmsMessageInput = {
  ticketUrl: string;
};

/** One GSM-7 SMS holds 160 septets. Unicode switches the whole message to UCS-2. */
const GSM_7_SINGLE_SEGMENT_MAX = 160;
const UCS2_SINGLE_SEGMENT_MAX = 70;

/** GSM 03.38 basic alphabet. One character outside this set forces UCS-2. */
const GSM_7_BASIC = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
);

/**
 * Latin ticket word per visitor locale.
 * Armenian/Cyrillic scripts would switch the whole SMS to a 70-character UCS-2 segment.
 */
const TICKET_WORD_BY_LOCALE: Record<Locale, string> = {
  hy: 'Toms',
  en: 'Ticket',
  ru: 'Bilet',
};

function buildTicketSmsBody(locale: Locale, ticketUrl: string): string {
  return `TOON EXPO ${TICKET_WORD_BY_LOCALE[locale]}: ${ticketUrl}`;
}

function fitsSingleSms(text: string): boolean {
  const gsm7 = [...text].every((char) => GSM_7_BASIC.has(char));
  const limit = gsm7 ? GSM_7_SINGLE_SEGMENT_MAX : UCS2_SINGLE_SEGMENT_MAX;
  return [...text].length <= limit;
}

/**
 * SMS body with the hosted-ticket link.
 * Copy stays Latin GSM-7: hy `Toms`, en `Ticket`, ru `Bilet`.
 * A body that would exceed one segment falls back to English so a resend stays one SMS.
 */
export function buildTicketSmsMessage(locale: Locale, input: TicketSmsMessageInput): string {
  const localized = buildTicketSmsBody(locale, input.ticketUrl);
  if (fitsSingleSms(localized)) {
    return localized;
  }
  return buildTicketSmsBody('en', input.ticketUrl);
}
