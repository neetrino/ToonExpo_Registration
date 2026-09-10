import { describe, expect, it } from 'vitest';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';

const shared = {
  ageBand: '35-44' as const,
  residence: { city: 'Moscow', region: 'Moscow Oblast' },
  armeniaConnection: 'family_from_armenia' as const,
  purchaseMotives: ['own_stays', 'investment_income'] as const,
  newsletter: true,
};

const propertyArmenia = { scope: 'armenia' as const };

describe('spyurkQuestionnaireAnswersSchema', () => {
  it('accepts own_residence happy path', () => {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      visitPurpose: 'own_residence',
      interestTypes: ['apartment_new', 'apartments'],
      propertyCountry: propertyArmenia,
      areaSqm: '70-90',
      purchaseMethod: 'cash',
      purchaseBudgetUsd: '150k-250k',
      decisionStage: 'searching_6_months',
      armeniaVisitTiming: 'within_3_months',
    });
    expect(parsed.success).toBe(true);
  });

  it('requires other text for armenia connection and motives', () => {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      armeniaConnection: 'other',
      purchaseMotives: ['other'],
      visitPurpose: 'own_residence',
      interestTypes: ['apartment_new'],
      propertyCountry: propertyArmenia,
      areaSqm: '70-90',
      purchaseMethod: 'cash',
      purchaseBudgetUsd: '150k-250k',
      decisionStage: 'just_researching',
      armeniaVisitTiming: 'not_planning',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts investment without area when only land is selected', () => {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      visitPurpose: 'investment',
      investmentPropertyTypes: ['land'],
      propertyCountry: { scope: 'other', country: 'Georgia' },
      investmentGoal: 'capital_preservation',
      purchaseMethod: 'cash',
      investmentTimeline: '6-12_months',
      investmentBudgetUsd: '150k-300k',
      priorInvestmentExperience: 'no_first',
      armeniaVisitTiming: 'within_1_year',
    });
    expect(parsed.success).toBe(true);
  });

  it('requires area for apartment investment and country for prior abroad', () => {
    const missingArea = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      visitPurpose: 'investment',
      investmentPropertyTypes: ['apartment'],
      propertyCountry: propertyArmenia,
      investmentGoal: 'rental_income',
      purchaseMethod: 'mortgage',
      investmentTimeline: 'up_to_3_months',
      investmentBudgetUsd: '150k-300k',
      priorInvestmentExperience: 'yes_abroad',
      armeniaVisitTiming: 'within_6_months',
    });
    expect(missingArea.success).toBe(false);

    const valid = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      visitPurpose: 'investment',
      investmentPropertyTypes: ['apartment'],
      propertyCountry: propertyArmenia,
      investmentGoal: 'rental_income',
      areaSqm: '50-70',
      purchaseMethod: 'mortgage',
      investmentTimeline: 'up_to_3_months',
      investmentBudgetUsd: '150k-300k',
      priorInvestmentExperience: 'yes_both',
      priorInvestmentExperienceOther: 'UAE',
      armeniaVisitTiming: 'within_6_months',
    });
    expect(valid.success).toBe(true);
  });

  it('accepts market research with relocation goal', () => {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse({
      ...shared,
      visitPurpose: 'market_research',
      marketInterests: ['new_apartments', 'investment_opportunities'],
      researchGoal: 'possible_relocation',
      propertyCountry: propertyArmenia,
      purchaseHorizon: 'no_plans',
      armeniaVisitTiming: 'not_planning',
    });
    expect(parsed.success).toBe(true);
  });
});
