import type { Locale } from '@/types/locale';
import { TICKET_QR_CONTENT_ID } from '@/lib/delivery/constants';

export type TicketEmailMessageInput = {
  firstName: string;
  ticketCode: string;
  ticketUrl: string;
  siteUrl: string;
};

export type TicketEmailMessage = {
  subject: string;
  text: string;
  html: string;
};

type MessageBuilder = (input: TicketEmailMessageInput) => TicketEmailMessage;

const messageBuilders: Record<Locale, MessageBuilder> = {
  hy: buildHyMessage,
  en: buildEnMessage,
  ru: buildRuMessage,
};

/**
 * Build localized ticket email copy with readable code and hosted-ticket link.
 * HTML embeds the QR via CID (`ticket-qr`).
 */
export function buildTicketEmailMessage(
  locale: Locale,
  input: TicketEmailMessageInput,
): TicketEmailMessage {
  return messageBuilders[locale](input);
}

function buildEnMessage(input: TicketEmailMessageInput): TicketEmailMessage {
  const subject = 'TOON EXPO — your ticket';
  const text = [
    `Hello, ${input.firstName}.`,
    'Your TOON EXPO registration is confirmed. Keep this ticket for entry.',
    `Ticket code: ${input.ticketCode}`,
    `Open your ticket: ${input.ticketUrl}`,
    'Event details (TBA):\n• Date: to be announced\n• Venue: to be announced',
    `Event website: ${input.siteUrl}`,
    '— TOON EXPO',
  ].join('\n\n');

  return {
    subject,
    text,
    html: buildHtml({
      locale: 'en',
      greeting: `Hello, ${escapeHtml(input.firstName)}.`,
      intro: 'Your TOON EXPO registration is confirmed. Keep this ticket for entry.',
      codeLabel: 'Ticket code',
      ticketCode: input.ticketCode,
      linkLabel: 'Open your ticket',
      ticketUrl: input.ticketUrl,
      details: 'Event details (TBA): Date and venue will be announced soon.',
      siteLabel: 'Event website',
      siteUrl: input.siteUrl,
    }),
  };
}

function buildHyMessage(input: TicketEmailMessageInput): TicketEmailMessage {
  const subject = 'TOON EXPO — ձեր տոմսը';
  const text = [
    `Բարև, ${input.firstName}։`,
    'Ձեր TOON EXPO գրանցումը հաստատված է։ Պահեք այս տոմսը մուտքի համար։',
    `Տոմսի կոդ՝ ${input.ticketCode}`,
    `Բացել տոմսը՝ ${input.ticketUrl}`,
    'Միջոցառման մանրամասներ (TBA).\n• Ամսաթիվ. կհայտարարվի ավելի ուշ\n• Վայր. կհայտարարվի ավելի ուշ',
    `Միջոցառման կայք՝ ${input.siteUrl}`,
    '— TOON EXPO',
  ].join('\n\n');

  return {
    subject,
    text,
    html: buildHtml({
      locale: 'hy',
      greeting: `Բարև, ${escapeHtml(input.firstName)}։`,
      intro: 'Ձեր TOON EXPO գրանցումը հաստատված է։ Պահեք այս տոմսը մուտքի համար։',
      codeLabel: 'Տոմսի կոդ',
      ticketCode: input.ticketCode,
      linkLabel: 'Բացել տոմսը',
      ticketUrl: input.ticketUrl,
      details: 'Միջոցառման մանրամասներ (TBA). Ամսաթիվը և վայրը կհայտարարվեն ավելի ուշ։',
      siteLabel: 'Միջոցառման կայք',
      siteUrl: input.siteUrl,
    }),
  };
}

function buildRuMessage(input: TicketEmailMessageInput): TicketEmailMessage {
  const subject = 'TOON EXPO — ваш билет';
  const text = [
    `Здравствуйте, ${input.firstName}.`,
    'Ваша регистрация на TOON EXPO подтверждена. Сохраните этот билет для входа.',
    `Код билета: ${input.ticketCode}`,
    `Открыть билет: ${input.ticketUrl}`,
    'Детали мероприятия (TBA):\n• Дата: будет объявлена позже\n• Место: будет объявлено позже',
    `Сайт мероприятия: ${input.siteUrl}`,
    '— TOON EXPO',
  ].join('\n\n');

  return {
    subject,
    text,
    html: buildHtml({
      locale: 'ru',
      greeting: `Здравствуйте, ${escapeHtml(input.firstName)}.`,
      intro: 'Ваша регистрация на TOON EXPO подтверждена. Сохраните этот билет для входа.',
      codeLabel: 'Код билета',
      ticketCode: input.ticketCode,
      linkLabel: 'Открыть билет',
      ticketUrl: input.ticketUrl,
      details: 'Детали мероприятия (TBA): дата и место будут объявлены позже.',
      siteLabel: 'Сайт мероприятия',
      siteUrl: input.siteUrl,
    }),
  };
}

type HtmlParts = {
  locale: string;
  greeting: string;
  intro: string;
  codeLabel: string;
  ticketCode: string;
  linkLabel: string;
  ticketUrl: string;
  details: string;
  siteLabel: string;
  siteUrl: string;
};

function buildHtml(parts: HtmlParts): string {
  return `<!DOCTYPE html>
<html lang="${parts.locale}">
<body style="margin:0;padding:24px;background:#f4f7f8;color:#00303d;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;">
    <tr><td style="font-size:22px;font-weight:800;">TOON EXPO</td></tr>
    <tr><td style="padding-top:16px;font-size:16px;line-height:1.5;">${parts.greeting}</td></tr>
    <tr><td style="padding-top:8px;font-size:16px;line-height:1.5;">${parts.intro}</td></tr>
    <tr><td style="padding-top:20px;text-align:center;">
      <img src="cid:${TICKET_QR_CONTENT_ID}" alt="Ticket QR" width="240" height="240" style="display:block;margin:0 auto;border:0;" />
    </td></tr>
    <tr><td style="padding-top:16px;text-align:center;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#00303d99;">${escapeHtml(parts.codeLabel)}</td></tr>
    <tr><td style="padding-top:4px;text-align:center;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:22px;font-weight:700;letter-spacing:0.08em;">${escapeHtml(parts.ticketCode)}</td></tr>
    <tr><td style="padding-top:20px;text-align:center;">
      <a href="${escapeHtml(parts.ticketUrl)}" style="display:inline-block;background:#00303d;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:700;">${escapeHtml(parts.linkLabel)}</a>
    </td></tr>
    <tr><td style="padding-top:20px;font-size:14px;line-height:1.5;color:#00303dcc;">${escapeHtml(parts.details)}</td></tr>
    <tr><td style="padding-top:12px;font-size:14px;line-height:1.5;">
      ${escapeHtml(parts.siteLabel)}:<br />
      <a href="${escapeHtml(parts.siteUrl)}" style="color:#00303d;">${escapeHtml(parts.siteUrl)}</a>
    </td></tr>
    <tr><td style="padding-top:24px;font-size:14px;">— TOON EXPO</td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
