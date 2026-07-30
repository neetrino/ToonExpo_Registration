/**
 * Opt-in cron switches.
 * true|1 → ON (process retry jobs).
 * unset|false|other → OFF (return DISABLED, do not touch Neon).
 */
export function isCronFlagEnabled(envName: string): boolean {
  const raw = process.env[envName]?.trim().toLowerCase();
  return raw === 'true' || raw === '1';
}

export const DELIVERY_CRON_ENABLED_ENV = 'DELIVERY_CRON_ENABLED';
export const MOOTQ_PUSH_CRON_ENABLED_ENV = 'MOOTQ_PUSH_CRON_ENABLED';
