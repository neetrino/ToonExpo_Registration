import { getEnv } from '@/lib/env';
import { buildConfirmationMessage } from '@/lib/email/confirmation-messages';
import { logger } from '@/lib/logger';
import type { Locale } from '@/generated/prisma';

const EMAIL_TIMEOUT_MS = 8_000;

export type ConfirmationEmailInput = {
  registrationId: string;
  email: string;
  firstName: string;
  locale: Locale;
};

export type ConfirmationEmailResult =
  | { ok: true; messageId: string | undefined }
  | { ok: false; reason: string };

/**
 * Attempt confirmation email via Resend. Never throws; failures are returned.
 * Placeholder API keys skip the network call and report a safe failure.
 */
export async function sendConfirmationEmail(
  input: ConfirmationEmailInput,
): Promise<ConfirmationEmailResult> {
  let apiKey: string;
  let from: string;
  let siteUrl: string;

  try {
    const env = getEnv();
    apiKey = env.RESEND_API_KEY;
    from = env.RESEND_FROM_EMAIL;
    siteUrl = env.SITE_URL;
  } catch {
    return { ok: false, reason: 'env_unavailable' };
  }

  if (isPlaceholderResendKey(apiKey)) {
    logger.info('Confirmation email skipped (placeholder Resend key)', {
      registrationId: input.registrationId,
    });
    return { ok: false, reason: 'placeholder_key' };
  }

  const message = buildConfirmationMessage(input.locale, {
    firstName: input.firstName,
    siteUrl,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

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
      }),
    });

    if (!response.ok) {
      logger.error('Resend confirmation email failed', {
        registrationId: input.registrationId,
        status: response.status,
      });
      return { ok: false, reason: `http_${response.status}` };
    }

    const payload = (await response.json()) as { id?: string };
    return { ok: true, messageId: payload.id };
  } catch (error: unknown) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network';
    logger.error('Resend confirmation email error', {
      registrationId: input.registrationId,
      reason,
    });
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}

function isPlaceholderResendKey(key: string): boolean {
  return key.includes('replace') || key === 're_test';
}
