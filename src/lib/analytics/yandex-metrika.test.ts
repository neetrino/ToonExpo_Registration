import { afterEach, describe, expect, it, vi } from 'vitest';
import { REGISTRATION_COMPLETE_EVENT } from '@/lib/analytics/gtm';
import {
  DEFAULT_YANDEX_METRIKA_ID,
  buildYandexMetrikaSnippet,
  hitYandexMetrika,
  parseYandexMetrikaId,
  resolveYandexMetrikaId,
  trackYandexRegistrationComplete,
} from '@/lib/analytics/yandex-metrika';

describe('parseYandexMetrikaId', () => {
  it('accepts the client counter', () => {
    expect(parseYandexMetrikaId(DEFAULT_YANDEX_METRIKA_ID)).toBe(DEFAULT_YANDEX_METRIKA_ID);
  });

  it('rejects empty and invalid values', () => {
    expect(parseYandexMetrikaId(undefined)).toBeNull();
    expect(parseYandexMetrikaId('')).toBeNull();
    expect(parseYandexMetrikaId('abc')).toBeNull();
    expect(parseYandexMetrikaId('112495551;alert(1)')).toBeNull();
  });
});

describe('resolveYandexMetrikaId', () => {
  it('falls back to the client counter when env is unset', () => {
    expect(resolveYandexMetrikaId(undefined)).toBe(DEFAULT_YANDEX_METRIKA_ID);
  });

  it('disables Metrika when env is blank', () => {
    expect(resolveYandexMetrikaId('')).toBeNull();
  });
});

describe('buildYandexMetrikaSnippet', () => {
  it('embeds only a validated numeric id', () => {
    const snippet = buildYandexMetrikaSnippet(DEFAULT_YANDEX_METRIKA_ID);

    expect(snippet).toContain(`tag.js?id=${DEFAULT_YANDEX_METRIKA_ID}`);
    expect(snippet).toContain(`ym(${DEFAULT_YANDEX_METRIKA_ID}, 'init'`);
    expect(buildYandexMetrikaSnippet('not-an-id')).toBe('');
  });
});

describe('Yandex Metrika client calls', () => {
  afterEach(() => {
    delete window.ym;
  });

  it('sends a hit and a registration goal when ym is present', () => {
    const ym = vi.fn();
    window.ym = ym;

    hitYandexMetrika('https://reg.toonexpo.com/hy/success');
    trackYandexRegistrationComplete();

    expect(ym).toHaveBeenCalledWith(
      Number(DEFAULT_YANDEX_METRIKA_ID),
      'hit',
      'https://reg.toonexpo.com/hy/success',
    );
    expect(ym).toHaveBeenCalledWith(
      Number(DEFAULT_YANDEX_METRIKA_ID),
      'reachGoal',
      REGISTRATION_COMPLETE_EVENT,
    );
  });

  it('no-ops when ym is missing', () => {
    expect(() => hitYandexMetrika('https://reg.toonexpo.com/hy')).not.toThrow();
    expect(() => trackYandexRegistrationComplete()).not.toThrow();
  });
});
