import type { Locale } from '@/types/locale';

export type TicketSmsMessageInput = {
  ticketUrl: string;
};

type MessageBuilder = (input: TicketSmsMessageInput) => string;

/**
 * One Latin GSM-7 body for every locale.
 * Armenian or Cyrillic switches the SMS to UCS-2 (70 characters). The hosted-ticket
 * URL is already longer than that, so any non-GSM character bills a second segment.
 */
function gsmTicketSms({ ticketUrl }: TicketSmsMessageInput): string {
  return `TOON EXPO ticket: ${ticketUrl}`;
}

const messageBuilders: Record<Locale, MessageBuilder> = {
  hy: gsmTicketSms,
  en: gsmTicketSms,
  ru: gsmTicketSms,
};

/**
 * Build GSM-7 SMS copy with the hosted-ticket link. Fits in one 160-character segment.
 */
export function buildTicketSmsMessage(locale: Locale, input: TicketSmsMessageInput): string {
  return messageBuilders[locale](input);
}
