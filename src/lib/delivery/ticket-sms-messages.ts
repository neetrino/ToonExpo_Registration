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

type MessageBuilder = (ticketUrl: string) => string;

function latinTicketSms(ticketUrl: string): string {
  return `TOON EXPO ticket: ${ticketUrl}`;
}

const localizedBuilders: Record<Locale, MessageBuilder> = {
  hy: latinTicketSms,
  en: latinTicketSms,
  ru: (ticketUrl) => `Билет: ${ticketUrl}`,
};

function fitsSingleSms(text: string): boolean {
  const gsm7 = [...text].every((char) => GSM_7_BASIC.has(char));
  const limit = gsm7 ? GSM_7_SINGLE_SEGMENT_MAX : UCS2_SINGLE_SEGMENT_MAX;
  return [...text].length <= limit;
}

/**
 * SMS body with the hosted-ticket link.
 * Armenian uses Latin GSM-7 (`TOON EXPO ticket:`) so Dexatel logs stay ASCII.
 * Russian copy is used when it fits in one 70-character UCS-2 segment.
 * Longer legacy links fall back to Latin GSM-7 so the send still costs one SMS.
 */
export function buildTicketSmsMessage(locale: Locale, input: TicketSmsMessageInput): string {
  const localized = localizedBuilders[locale](input.ticketUrl);
  if (fitsSingleSms(localized)) {
    return localized;
  }
  return latinTicketSms(input.ticketUrl);
}
