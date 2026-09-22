import type { Locale } from '@/types/locale';
import { TICKET_QR_CONTENT_ID } from '@/lib/delivery/constants';

export type TicketEmailMessageInput = {
  firstName: string;
  lastName: string;
  ticketCode: string;
  ticketUrl: string;
  siteUrl: string;
};

export type TicketEmailMessage = {
  subject: string;
  text: string;
  html: string;
};

/** Public sender. Footer unsubscribe uses this mailbox. */
export const TICKET_EMAIL_UNSUBSCRIBE_ADDRESS = 'hi@mail.toonexpo.com';

export const TICKET_EMAIL_LIST_UNSUBSCRIBE = `<mailto:${TICKET_EMAIL_UNSUBSCRIBE_ADDRESS}?subject=Unsubscribe%20TOON%20EXPO>`;

const EVENT_MAP_URL = 'https://yandex.com/maps/-/CThIYFMT';
const EVENT_TITLE = 'TOON EXPO․ INVEST 2026 Vol. 2';
const EVENT_HOURS = '11:00–21:00';

type EmailCopy = {
  subject: string;
  greeting: (name: string) => string;
  confirmed: string;
  qrLabel: string;
  saveQr: string;
  dates: string;
  venue: string;
  codeLabel: string;
  downloadLead: string;
  downloadLink: string;
  footerLead: string;
  footerLink: string;
};

const copyByLocale: Record<Locale, EmailCopy> = {
  hy: {
    subject: 'TOON EXPO - Ձեր գրանցումը հաստատված է',
    greeting: (name) => `Հարգելի ${name},`,
    confirmed: 'Ձեր գրանցումը հաստատված է:',
    qrLabel: 'Ձեր մուտքի QR կոդը',
    saveQr: 'Պահպանեք QR կոդը՝ ցուցահանդեսային տարածք մուտք գործելու համար։',
    dates: 'Նոյեմբերի 13 | 14 | 15',
    venue: 'Մերիդիան Էքսպո Կենտրոն (Ոսկերիչների 1, Երևան)',
    codeLabel: 'Տոմսի կոդ',
    downloadLead: 'Մուտքի տոմսը կարող եք նաև ներբեռնել',
    downloadLink: 'այստեղ․',
    footerLead: 'Եթե այլևս չեք ցանկանում ստանալ այս նամակները, կարող եք',
    footerLink: 'ապաբաժանորդագրվել',
  },
  en: {
    subject: 'TOON EXPO - Your registration is confirmed',
    greeting: (name) => `Dear ${name},`,
    confirmed: 'Your registration is confirmed.',
    qrLabel: 'Your entry QR code',
    saveQr: 'Save the QR code to enter the exhibition.',
    dates: 'November 13 | 14 | 15',
    venue: 'Meridian Expo Center (1 Voskerichneri, Yerevan)',
    codeLabel: 'Ticket code',
    downloadLead: 'You can also download your entry ticket',
    downloadLink: 'here.',
    footerLead: 'If you no longer want these emails, you can',
    footerLink: 'unsubscribe',
  },
  ru: {
    subject: 'TOON EXPO - Ваша регистрация подтверждена',
    greeting: (name) => `Здравствуйте, ${name},`,
    confirmed: 'Ваша регистрация подтверждена.',
    qrLabel: 'Ваш QR-код для входа',
    saveQr: 'Сохраните QR-код для входа на территорию выставки.',
    dates: '13 | 14 | 15 ноября',
    venue: 'Meridian Expo Center (ул. Воскеричнери 1, Ереван)',
    codeLabel: 'Код билета',
    downloadLead: 'Входной билет также можно скачать',
    downloadLink: 'здесь.',
    footerLead: 'Если вы больше не хотите получать эти письма, вы можете',
    footerLink: 'отписаться',
  },
};

/**
 * Localized ticket email. QR is inline; the hosted ticket link is the download.
 */
export function buildTicketEmailMessage(
  locale: Locale,
  input: TicketEmailMessageInput,
): TicketEmailMessage {
  const copy = copyByLocale[locale];
  return {
    subject: copy.subject,
    text: buildPlainText(copy, input),
    html: buildHtml(locale, copy, input),
  };
}

function buildPlainText(copy: EmailCopy, input: TicketEmailMessageInput): string {
  return [
    copy.greeting(displayName(input.firstName, input.lastName)),
    copy.confirmed,
    copy.qrLabel,
    `${copy.codeLabel}: ${input.ticketCode}`,
    copy.saveQr,
    EVENT_TITLE,
    copy.dates,
    EVENT_HOURS,
    `${copy.venue}: ${EVENT_MAP_URL}`,
    `${copy.downloadLead} ${copy.downloadLink} ${input.ticketUrl}`,
    `${copy.footerLead} ${copy.footerLink}: mailto:${TICKET_EMAIL_UNSUBSCRIBE_ADDRESS}`,
    '— TOON EXPO',
  ].join('\n\n');
}

function buildHtml(locale: Locale, copy: EmailCopy, input: TicketEmailMessageInput): string {
  const name = escapeHtml(displayName(input.firstName, input.lastName));
  const code = escapeHtml(input.ticketCode);
  const ticketUrl = escapeHtml(input.ticketUrl);
  const mapUrl = escapeHtml(EVENT_MAP_URL);
  const unsubscribeUrl = escapeHtml(
    `mailto:${TICKET_EMAIL_UNSUBSCRIBE_ADDRESS}?subject=Unsubscribe%20TOON%20EXPO`,
  );

  return `<!DOCTYPE html>
<html lang="${locale}">
<body style="margin:0;padding:0;background:#f4f7f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d7e2e5;border-radius:16px;">
        <tr><td style="height:6px;background:#ffd700;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#00303d;">
          <div style="font-size:22px;font-weight:800;letter-spacing:0.04em;">TOON EXPO</div>
          <p style="margin:22px 0 0;font-size:16px;line-height:1.5;">${copy.greeting(name)}</p>
          <p style="margin:8px 0 0;font-size:16px;line-height:1.5;">${escapeHtml(copy.confirmed)}</p>
        </td></tr>
        ${qrSection(copy, code)}
        ${eventSection(copy, mapUrl)}
        ${downloadSection(copy, ticketUrl)}
        ${footerSection(copy, unsubscribeUrl)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function qrSection(copy: EmailCopy, ticketCode: string): string {
  return `<tr><td style="padding:8px 28px 0;font-family:Arial,Helvetica,sans-serif;color:#00303d;text-align:center;">
    <p style="margin:16px 0 12px;font-size:16px;font-weight:700;">${escapeHtml(copy.qrLabel)}</p>
    <img src="cid:${TICKET_QR_CONTENT_ID}" alt="${escapeHtml(copy.qrLabel)}" width="220" height="220" style="display:block;margin:0 auto;border:0;background:#ffffff;" />
    <p style="margin:14px 0 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#4a5f66;">${escapeHtml(copy.codeLabel)}</p>
    <p style="margin:4px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:20px;font-weight:700;letter-spacing:0.08em;">${ticketCode}</p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#00303d;">${escapeHtml(copy.saveQr)}</p>
  </td></tr>`;
}

function eventSection(copy: EmailCopy, mapUrl: string): string {
  return `<tr><td style="padding:20px 28px 0;font-family:Arial,Helvetica,sans-serif;color:#00303d;">
    <p style="margin:0;font-size:16px;font-weight:700;line-height:1.5;">${escapeHtml(EVENT_TITLE)}</p>
    <p style="margin:10px 0 0;font-size:15px;font-weight:700;line-height:1.7;">📅 ${escapeHtml(copy.dates)}<br />🕚 ${escapeHtml(EVENT_HOURS)}<br />📍 <a href="${mapUrl}" style="color:#00303d;font-weight:700;text-decoration:underline;">${escapeHtml(copy.venue)}</a></p>
  </td></tr>`;
}

function downloadSection(copy: EmailCopy, ticketUrl: string): string {
  return `<tr><td style="padding:20px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#00303d;">
    ${escapeHtml(copy.downloadLead)} <a href="${ticketUrl}" style="color:#00303d;font-weight:700;">${escapeHtml(copy.downloadLink)}</a>
  </td></tr>`;
}

function footerSection(copy: EmailCopy, unsubscribeUrl: string): string {
  return `<tr><td style="padding:22px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
    <p style="margin:0;padding-top:16px;border-top:1px solid #d7e2e5;font-size:12px;line-height:1.5;color:#4a5f66;">
      ${escapeHtml(copy.footerLead)} <a href="${unsubscribeUrl}" style="color:#00303d;">${escapeHtml(copy.footerLink)}</a>.
    </p>
  </td></tr>`;
}

function displayName(firstName: string, lastName: string): string {
  return [firstName, lastName]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(' ');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
