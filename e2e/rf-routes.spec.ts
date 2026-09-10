import { test, expect } from '@playwright/test';

test.describe('Spyurk RF routes', () => {
  test('redirects /rf to /ru/rf and keeps UTM query', async ({ page }) => {
    await page.goto('/rf?utm_source=vk&utm_campaign=spyurk');
    await expect(page).toHaveURL(/\/ru\/rf\?utm_source=vk&utm_campaign=spyurk$/);
    await expect(page.locator('#firstName')).toBeVisible();
  });

  test('opens Russian even when the locale cookie is English', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/en');
    await expect(page).toHaveURL(/\/en$/);

    await page.goto('/rf');
    await expect(page).toHaveURL(/\/ru\/rf$/);
    await expect(page.locator('#firstName')).toBeVisible();

    await context.close();
  });

  test('serves localized Spyurk pages without changing the short-link default', async ({
    page,
  }) => {
    await page.goto('/en/rf');
    await expect(page).toHaveURL(/\/en\/rf$/);
    await expect(page.locator('#firstName')).toBeVisible();
  });
});
