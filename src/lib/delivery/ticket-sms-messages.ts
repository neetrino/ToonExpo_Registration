import type { Locale } from '@/types/locale';

export type TicketSmsMessageInput = {
  ticketUrl: string;
};

type MessageBuilder = (input: TicketSmsMessageInput) => string;

const messageBuilders: Record<Locale, MessageBuilder> = {
  hy: ({ ticketUrl }) => `TOON EXPO տոմս՝ ${ticketUrl}`,
  en: ({ ticketUrl }) => `TOON EXPO ticket: ${ticketUrl}`,
  ru: ({ ticketUrl }) => `Билет TOON EXPO: ${ticketUrl}`,
};

/**
 * Build short localized SMS copy with the hosted-ticket link.
 */
export function buildTicketSmsMessage(locale: Locale, input: TicketSmsMessageInput): string {
  return messageBuilders[locale](input);
}
