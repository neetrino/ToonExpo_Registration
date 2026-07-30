import { afterEach, describe, expect, it } from 'vitest';
import {
  DELIVERY_CRON_ENABLED_ENV,
  isCronFlagEnabled,
  MOOTQ_PUSH_CRON_ENABLED_ENV,
} from '@/lib/ops/cron-flags';

describe('isCronFlagEnabled', () => {
  const originalDelivery = process.env[DELIVERY_CRON_ENABLED_ENV];
  const originalMootq = process.env[MOOTQ_PUSH_CRON_ENABLED_ENV];

  afterEach(() => {
    if (originalDelivery === undefined) {
      delete process.env[DELIVERY_CRON_ENABLED_ENV];
    } else {
      process.env[DELIVERY_CRON_ENABLED_ENV] = originalDelivery;
    }
    if (originalMootq === undefined) {
      delete process.env[MOOTQ_PUSH_CRON_ENABLED_ENV];
    } else {
      process.env[MOOTQ_PUSH_CRON_ENABLED_ENV] = originalMootq;
    }
  });

  it('is disabled when unset', () => {
    delete process.env[DELIVERY_CRON_ENABLED_ENV];
    expect(isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)).toBe(false);
  });

  it('accepts true and 1 case-insensitively', () => {
    process.env[DELIVERY_CRON_ENABLED_ENV] = 'true';
    expect(isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)).toBe(true);
    process.env[DELIVERY_CRON_ENABLED_ENV] = 'TRUE';
    expect(isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)).toBe(true);
    process.env[MOOTQ_PUSH_CRON_ENABLED_ENV] = '1';
    expect(isCronFlagEnabled(MOOTQ_PUSH_CRON_ENABLED_ENV)).toBe(true);
  });

  it('rejects false and other values', () => {
    process.env[DELIVERY_CRON_ENABLED_ENV] = 'false';
    expect(isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)).toBe(false);
    process.env[DELIVERY_CRON_ENABLED_ENV] = 'yes';
    expect(isCronFlagEnabled(DELIVERY_CRON_ENABLED_ENV)).toBe(false);
  });
});
