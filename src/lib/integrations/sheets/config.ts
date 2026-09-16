import {
  SHEETS_WEBHOOK_SECRET_ENV,
  SHEETS_WEBHOOK_URL_ENV,
} from '@/lib/integrations/sheets/constants';

export type SheetsWebhookConfig =
  | { ok: true; url: string; secret: string }
  | { ok: false; reason: 'NOT_CONFIGURED' | 'URL_INVALID' };

export function isAllowedSheetsWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    if (parsed.username || parsed.password) {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return host === 'script.google.com' || host.endsWith('.script.google.com');
  } catch {
    return false;
  }
}

/**
 * Optional Sheets webhook credentials.
 * Both URL and secret must be set; otherwise sync stays PENDING.
 */
export function getSheetsWebhookConfig(): SheetsWebhookConfig {
  const url = process.env[SHEETS_WEBHOOK_URL_ENV]?.trim() ?? '';
  const secret = process.env[SHEETS_WEBHOOK_SECRET_ENV]?.trim() ?? '';

  if (!url || !secret) {
    return { ok: false, reason: 'NOT_CONFIGURED' };
  }

  if (!isAllowedSheetsWebhookUrl(url)) {
    return { ok: false, reason: 'URL_INVALID' };
  }

  return { ok: true, url, secret };
}
