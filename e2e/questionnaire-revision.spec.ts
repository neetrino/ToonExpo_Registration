import { expect, test, type Page } from '@playwright/test';
import { initialWizardState } from '../src/components/registration/wizard/types';
import { initialSpyurkWizardState } from '../src/components/registration/spyurk/types';
import { registrationBodySchema } from '../src/lib/validation/registration-schema';

const nextButton = (page: Page) => page.getByRole('button', { name: /^(Next|Далее|Հաջորդ)$/ });
const generalKey = 'toon-expo-registration-wizard-v2';
const spyurkKey = 'toon-expo-registration-wizard-spyurk-v1';
const identity = {
  firstName: 'Test',
  lastName: 'Visitor',
  email: 'test@example.com',
  phone: '99123456',
  phoneCountry: 'AM' as const,
};

async function seed(page: Page, key: string, state: object, currentStep: string) {
  await page.addInitScript(
    ({ key, state, currentStep }) => {
      sessionStorage.setItem(key, JSON.stringify({ state, currentStep }));
    },
    { key, state, currentStep },
  );
}

for (const locale of ['hy', 'en', 'ru']) {
  test(`general investment: four goals and conditional mortgage answer in ${locale}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await seed(
      page,
      generalKey,
      {
        ...initialWizardState,
        ...identity,
        ageBand: '35-44',
        residenceScope: 'yerevan',
        residenceDistrict: 'kentron',
        visitPurpose: 'investment',
        investmentPropertyType: 'apartment',
        locationSeekScopes: ['yerevan'],
        yerevanDistricts: ['kentron'],
      },
      'investment-goal',
    );
    await page.goto(`/${locale}`);
    const goals = page.locator('input[name="investmentGoal"]');
    await expect(goals).toHaveCount(4);
    for (const goal of await goals.all()) await goal.check();
    await page.locator('#investmentTimeline-up_to_3_months').check();
    await nextButton(page).click();
    await page.locator('#investmentAreaSqm-70-90').check();
    await expect(page.locator('#investmentPurchaseMethod-mixed')).toHaveCount(0);
    await expect(page.locator('input[name="incomeTaxRefund"]')).toHaveCount(0);
    await page.locator('#investmentPurchaseMethod-mortgage').check();
    await expect(page.locator('input[name="incomeTaxRefund"]')).toHaveCount(2);
    await nextButton(page).click();
    await expect(page.locator('input[name="incomeTaxRefund"]').first()).toBeVisible();
    await page.locator('#incomeTaxRefund-no').check();
    if (locale === 'hy') {
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: '/tmp/toon-questionnaire-mobile.png', fullPage: true });
    }
    await nextButton(page).click();
    await page.locator('#investmentBudgetUsd-up_to_150k').check();
    await page.locator('#priorInvestmentExperience-no_first').check();
    await nextButton(page).click();
    await page.locator('#privacyConsent').check();
    const requestPromise = page.waitForRequest((request) =>
      request.url().endsWith('/api/registrations'),
    );
    await page.route('**/api/registrations', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'INTERNAL_ERROR' }),
      }),
    );
    await page
      .getByRole('button', {
        name: /^(Submit registration|Отправить регистрацию|Ուղարկել գրանցումը)$/,
      })
      .click();
    const payload = (await requestPromise).postDataJSON();
    expect(registrationBodySchema.safeParse(payload).success).toBe(true);
    expect(payload.answers.investmentGoal).toHaveLength(4);
    expect(payload.answers.incomeTaxRefund).toBe(false);
    expect(payload.answers).not.toHaveProperty('newsletter');
    expect(errors).toEqual([]);
  });

  test(`Spyurk: mortgage follow-up and cash switch in ${locale}`, async ({ page }) => {
    await seed(
      page,
      spyurkKey,
      {
        ...initialSpyurkWizardState,
        ...identity,
        ageBand: '35-44',
        residenceCity: 'Москва',
        residenceRegion: 'Москва',
        armeniaConnection: 'born_in_armenia',
        purchaseMotives: ['own_stays'],
        visitPurpose: 'own_residence',
        interestTypes: ['apartment_new'],
        propertyCountryScope: 'armenia',
      },
      'own-details',
    );
    await page.goto(`/${locale}/rf`);
    await page.locator('#areaSqm-70-90').check();
    await expect(page.locator('#purchaseMethod-mixed')).toHaveCount(0);
    await page.locator('#purchaseMethod-mortgage').check();
    await expect(page.locator('#incomeTaxRefund-yes')).toBeVisible();
    await page.locator('#incomeTaxRefund-yes').check();
    await page.locator('#purchaseMethod-cash').check();
    await expect(page.locator('input[name="incomeTaxRefund"]')).toHaveCount(0);
    await page.locator('#purchaseBudgetUsd-150k-250k').check();
    await page.locator('#decisionStage-searching_6_months').check();
    await nextButton(page).click();
    await expect(page.locator('#armeniaVisitTiming-within_3_months')).toBeVisible();
  });
}

test('residence is region-only and offers searchable countries', async ({ page }) => {
  await seed(page, generalKey, { ...initialWizardState, ...identity }, 'profile');
  await page.goto('/ru');
  await page.locator('#residenceScope-marz').check();
  await page.locator('#residenceRegion-kotayk').check();
  await expect(page.locator('input[name^="residenceMarzCity"]')).toHaveCount(0);
  await page.locator('#residenceScope-abroad').check();
  await page.locator('#residenceCountry').focus();
  const countries = page.getByRole('option');
  expect(await countries.count()).toBeGreaterThanOrEqual(249);
  await page.locator('#residenceCountry').fill('РФ');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.getByRole('option', { name: 'Российская Федерация' }).click();
  await page.locator('#ageBand-35-44').check();
  await page.locator('#visitPurpose-market_research').check();
  await nextButton(page).click();
  await expect(page.locator('input[name="marketInterests"]').first()).toBeVisible();
});

test('city follow-ups match the active branch', async ({ browser }) => {
  for (const visitPurpose of ['own_residence', 'investment'] as const) {
    const page = await browser.newPage();
    await seed(
      page,
      generalKey,
      { ...initialWizardState, ...identity, visitPurpose },
      visitPurpose === 'investment' ? 'investment-location' : 'own-residence-location',
    );
    await page.goto('/en');
    await page.locator('#locationSeekScopes-marz').check();
    await page.locator('#marzRegions-kotayk').check();
    if (visitPurpose === 'own_residence') {
      await expect(page.locator('#marzCity-kotayk-kanakeravan')).toBeVisible();
      await expect(page.locator('#marzCity-kotayk-tsaghkadzor')).toHaveCount(0);
      await page.locator('#marzCity-kotayk-kanakeravan').check();
    } else {
      await expect(page.locator('#marzCity-kotayk-kanakeravan')).toHaveCount(0);
      await page.locator('#marzCity-kotayk-tsaghkadzor').check();
    }
    await nextButton(page).click();
    await expect(
      page
        .locator(
          visitPurpose === 'investment' ? 'input[name="investmentGoal"]' : 'input[name="areaSqm"]',
        )
        .first(),
    ).toBeVisible();
    await page.close();
  }
});

test('Spyurk investment requires the mortgage answer even for land without a size question', async ({
  page,
}) => {
  await seed(
    page,
    spyurkKey,
    {
      ...initialSpyurkWizardState,
      ...identity,
      visitPurpose: 'investment',
      investmentPropertyTypes: ['land'],
    },
    'investment-details',
  );
  await page.goto('/ru/rf');
  await expect(page.locator('input[name="areaSqm"]')).toHaveCount(0);
  await page.locator('#purchaseMethod-mortgage').check();
  await page.locator('#investmentTimeline-up_to_3_months').check();
  await page.locator('#investmentBudgetUsd-up_to_150k').check();
  await nextButton(page).click();
  await expect(page.locator('#incomeTaxRefund-yes')).toBeVisible();
  await page.locator('#incomeTaxRefund-yes').check();
  await nextButton(page).click();
  await expect(page.locator('#priorInvestmentExperience-no_first')).toBeVisible();
});

test('market research does not ask for cities or newsletter consent', async ({ page }) => {
  await seed(
    page,
    generalKey,
    { ...initialWizardState, ...identity, visitPurpose: 'market_research' },
    'market-research-where',
  );
  await page.goto('/en');
  await page.locator('#researchScopes-marz').check();
  await page.locator('#researchMarzRegions-kotayk').check();
  await expect(page.locator('input[name^="researchMarzCity"]')).toHaveCount(0);
  await page.locator('#purchaseHorizon-no_plans').check();
  await nextButton(page).click();
  await expect(page.locator('#privacyConsent')).toBeVisible();
  await expect(page.locator('input[name="newsletter"]')).toHaveCount(0);
});
