import { afterEach, describe, expect, it } from 'vitest';
import { neetrinoCreditHref } from '@/lib/brand/site';

const PRODUCTION_CREDIT_HREF = 'https://neetrino.com/?utm_source=reg.toonexpo.com';

describe('neetrinoCreditHref', () => {
  const previousSiteUrl = process.env.SITE_URL;

  afterEach(() => {
    if (previousSiteUrl === undefined) {
      delete process.env.SITE_URL;
      return;
    }

    process.env.SITE_URL = previousSiteUrl;
  });

  it.each([
    'http://localhost:3001',
    'https://dev.neetrino.com',
    'https://toon-expo-preview.vercel.app',
  ])('uses the production host when SITE_URL is %s', (siteUrl) => {
    process.env.SITE_URL = siteUrl;

    expect(neetrinoCreditHref()).toBe(PRODUCTION_CREDIT_HREF);
  });
});
