import { getEnv } from '@/lib/env';
import { buildTicketEmailMessage } from '@/lib/delivery/ticket-email-messages';
import { DELIVERY_PROVIDER_TIMEOUT_MS, TICKET_QR_CONTENT_ID } from '@/lib/delivery/constants';
import { logger } from '@/lib/logger';
import { renderTicketQrPng } from '@/lib/tickets/qr';
import type { Locale } from '@/generated/prisma';

export type TicketEmailInput = {
  registrationId: string;
  email: string;
  firstName: string;
  locale: Locale;
  ticketCode: string;
  ticketViewToken: string;
};

export type TicketEmailResult =
  { ok: true; messageId: string | undefined } | { ok: false; reason: string; retryable: boolean };

/**
 * Send ticket email via Resend with inline QR, readable code, and hosted-ticket link.
 * Never throws; failures are returned with a safe reason.
 */
export async function sendTicketEmail(input: TicketEmailInput): Promise<TicketEmailResult> {
  let apiKey: string;
  let from: string;
  let siteUrl: string;

  try {
    const env = getEnv();
    apiKey = env.RESEND_API_KEY;
    from = env.RESEND_FROM_EMAIL;
    siteUrl = env.SITE_URL.replace(/\/$/, '');
  } catch {
    return { ok: false, reason: 'env_unavailable', retryable: true };
  }

  if (isPlaceholderResendKey(apiKey)) {
    logger.info('Ticket email skipped (placeholder Resend key)', {
      registrationId: input.registrationId,
    });
    return { ok: false, reason: 'placeholder_key', retryable: false };
  }

  const ticketUrl = `${siteUrl}/ticket/${encodeURIComponent(input.ticketViewToken)}`;
  const message = buildTicketEmailMessage(input.locale, {
    firstName: input.firstName,
    ticketCode: input.ticketCode,
    ticketUrl,
    siteUrl,
  });

  let qrPng: Buffer;
  try {
    qrPng = await renderTicketQrPng(input.ticketCode);
  } catch {
    logger.error('Ticket QR render failed', { registrationId: input.registrationId });
    return { ok: false, reason: 'qr_render_failed', retryable: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DELIVERY_PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        from,
        to: [input.email],
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: [
          {
            filename: `toon-expo-ticket-${input.ticketCode}.png`,
            content: qrPng.toString('base64'),
            content_id: TICKET_QR_CONTENT_ID,
          },
        ],
      }),
    });

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      logger.error('Resend ticket email failed', {
        registrationId: input.registrationId,
        status: response.status,
      });
      return { ok: false, reason: `http_${response.status}`, retryable };
    }

    const payload = (await response.json()) as { id?: string };
    return { ok: true, messageId: payload.id };
  } catch (error: unknown) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network';
    logger.error('Resend ticket email error', {
      registrationId: input.registrationId,
      reason,
    });
    return { ok: false, reason, retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

function isPlaceholderResendKey(key: string): boolean {
  return key.includes('replace') || key === 're_test';
}
