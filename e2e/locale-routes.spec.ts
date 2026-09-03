import { test, expect } from '@playwright/test';
import { routing } from '../src/i18n/routing';

test.describe('public routes', () => {
  test('redirects root to Armenian even when the browser prefers English', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: 'en-US',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
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

  test('remembers the chosen locale when returning to root', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'en-US',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const page = await context.newPage();

    await page.goto('/en');
    await expect(page).toHaveURL(/\/en$/);

    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await context.close();
  });
});
