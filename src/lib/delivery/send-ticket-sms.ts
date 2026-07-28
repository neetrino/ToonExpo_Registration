import { getEnv } from '@/lib/env';
import { DELIVERY_PROVIDER_TIMEOUT_MS } from '@/lib/delivery/constants';
import { buildTicketSmsMessage } from '@/lib/delivery/ticket-sms-messages';
import { getDexatelSmsConfig } from '@/lib/integrations/dexatel/config';
import { toDexatelPhoneDigits } from '@/lib/integrations/dexatel/phone';
import { logger } from '@/lib/logger';
import type { Locale } from '@/generated/prisma';

const DEXATEL_MESSAGES_URL = 'https://api.dexatel.com/v1/messages';

export type TicketSmsInput = {
  registrationId: string;
  phoneNormalized: string;
  locale: Locale;
  ticketViewToken: string;
};

export type TicketSmsResult =
  { ok: true; messageId: string | undefined } | { ok: false; reason: string; retryable: boolean };

/**
 * Send ticket-link SMS via Dexatel. Never throws; failures return a safe reason.
 */
export async function sendTicketSms(input: TicketSmsInput): Promise<TicketSmsResult> {
  const config = getDexatelSmsConfig();
  if (!config.ok) {
    return { ok: false, reason: 'not_configured', retryable: false };
  }

  let siteUrl: string;
  try {
    siteUrl = getEnv().SITE_URL.replace(/\/$/, '');
  } catch {
    return { ok: false, reason: 'env_unavailable', retryable: true };
  }

  const to = toDexatelPhoneDigits(input.phoneNormalized);
  if (!to) {
    return { ok: false, reason: 'invalid_phone', retryable: false };
  }

  const ticketUrl = `${siteUrl}/ticket/${encodeURIComponent(input.ticketViewToken)}`;
  const text = buildTicketSmsMessage(input.locale, { ticketUrl });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DELIVERY_PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(DEXATEL_MESSAGES_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Dexatel-Key': config.apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        data: {
          channel: 'SMS',
          from: config.from,
          to: [to],
          text,
          payload: input.registrationId.slice(0, 500),
        },
      }),
    });

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      logger.error('Dexatel ticket SMS failed', {
        registrationId: input.registrationId,
        status: response.status,
      });
      return { ok: false, reason: `http_${response.status}`, retryable };
    }

    const payload = (await response.json()) as {
      data?: Array<{ id?: string }> | { id?: string };
    };
    const messageId = Array.isArray(payload.data) ? payload.data[0]?.id : payload.data?.id;
    return { ok: true, messageId };
  } catch (error: unknown) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network';
    logger.error('Dexatel ticket SMS error', {
      registrationId: input.registrationId,
      reason,
    });
    return { ok: false, reason, retryable: true };
  } finally {
    clearTimeout(timer);
  }
}
