import { test, expect } from '@playwright/test';
import { routing } from '../src/i18n/routing';

test.describe('public routes', () => {
  test('redirects root to default locale when browser prefers hy', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'hy-AM',
      extraHTTPHeaders: { 'Accept-Language': 'hy,hy-AM;q=0.9,en;q=0.8' },
    });
    const page = await context.newPage();

    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`/${routing.defaultLocale}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await context.close();
  });

  test('serves explicit locale landing pages', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
