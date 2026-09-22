/**
 * Absolute hosted-ticket URL. SMS length depends on this path staying `/ticket/`.
 */
export function buildHostedTicketUrl(siteUrl: string, ticketViewToken: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  return `${origin}/ticket/${encodeURIComponent(ticketViewToken)}`;
}
