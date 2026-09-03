import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_GTM_CONTAINER_ID,
  parseGtmContainerId,
  pushRegistrationCompleteEvent,
  REGISTRATION_COMPLETE_EVENT,
  resolveGtmContainerId,
} from '@/lib/analytics/gtm';

describe('parseGtmContainerId', () => {
  it('accepts a standard container id', () => {
    expect(parseGtmContainerId('GTM-NJZV2NL3')).toBe('GTM-NJZV2NL3');
  });

  it('rejects empty and invalid values', () => {
    expect(parseGtmContainerId(undefined)).toBeNull();
    expect(parseGtmContainerId('')).toBeNull();
    expect(parseGtmContainerId('gtm-njzv2nl3')).toBeNull();
    expect(parseGtmContainerId('UA-123')).toBeNull();
  });
});

describe('resolveGtmContainerId', () => {
  it('falls back to the client container when env is unset', () => {
    expect(resolveGtmContainerId(undefined)).toBe(DEFAULT_GTM_CONTAINER_ID);
  });

  it('disables GTM when env is blank', () => {
    expect(resolveGtmContainerId('')).toBeNull();
  });
});

describe('pushRegistrationCompleteEvent', () => {
  const originalDataLayer = window.dataLayer;

  afterEach(() => {
    window.dataLayer = originalDataLayer;
    vi.unstubAllGlobals();
  });

  it('pushes the conversion event with the current path', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy/success' });

    pushRegistrationCompleteEvent();

    expect(window.dataLayer).toEqual([
      { event: REGISTRATION_COMPLETE_EVENT, page_path: '/hy/success' },
    ]);
  });
});
