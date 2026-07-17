import { test, expect } from '@playwright/test';

test.describe('public routes', () => {
  test('redirects root to default locale landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/hy$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
