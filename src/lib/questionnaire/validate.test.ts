import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

const sharedOwnResidence = {
  ageBand: '35-44' as const,
  visitPurpose: 'own_residence' as const,
  areaSqm: '70-90' as const,
  purchaseMethod: 'mortgage' as const,
  monthlyBudget: '300k-500k' as const,
  decisionStage: 'searching_6_months' as const,
  newsletter: true,
};

const validOwnResidence = {
  ...sharedOwnResidence,
  interestType: 'apartment_new' as const,
  locationSeek: {
    scope: 'yerevan' as const,
    districts: ['kentron', 'arabkir'] as const,
  },
};

const validInvestment = {
  ageBand: '25-34' as const,
  visitPurpose: 'investment' as const,
  investmentPropertyType: 'apartment' as const,
  investmentMarket: 'armenia' as const,
  investmentGoal: 'rental_income' as const,
  investmentTimeline: '6_months' as const,
  investmentBudgetUsd: '100k-250k' as const,
  priorInvestmentExperience: 'no_first' as const,
  newsletter: false,
};

const validMarketResearch = {
  ageBand: '45-54' as const,
  visitPurpose: 'market_research' as const,
  marketInterests: ['new_apartments', 'price_trends'] as const,
  researchGoal: 'browse_offers' as const,
  interestedWhere: 'yerevan' as const,
  purchaseHorizon: '1-2_years' as const,
  newsletter: true,
};

describe('questionnaireAnswersSchema', () => {
  it('accepts own_residence happy path', () => {
    const parsed = questionnaireAnswersSchema.safeParse(validOwnResidence);
    expect(parsed.success).toBe(true);
  });

  it('accepts own_residence abroad interest without locationSeek', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'abroad',
      abroadCountries: ['uae', 'other'],
      abroadCountriesOther: 'Portugal',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts investment happy path', () => {
    const parsed = questionnaireAnswersSchema.safeParse(validInvestment);
    expect(parsed.success).toBe(true);
  });

  it('accepts market_research happy path', () => {
    const parsed = questionnaireAnswersSchema.safeParse(validMarketResearch);
    expect(parsed.success).toBe(true);
  });

  it('rejects own_residence-only payload when visitPurpose is investment', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ageBand: '35-44',
      visitPurpose: 'investment',
      interestType: 'apartment_new',
      locationSeek: {
        scope: 'yerevan',
        districts: ['kentron'],
      },
      areaSqm: '70-90',
      purchaseMethod: 'mortgage',
      monthlyBudget: '300k-500k',
      decisionStage: 'searching_6_months',
      newsletter: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects investment-only payload when visitPurpose is own_residence', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ageBand: '25-34',
      visitPurpose: 'own_residence',
      investmentPropertyType: 'apartment',
      investmentMarket: 'armenia',
      investmentGoal: 'rental_income',
      investmentTimeline: '6_months',
      investmentBudgetUsd: '100k-250k',
      priorInvestmentExperience: 'no_first',
      newsletter: false,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects market_research-only payload when visitPurpose is investment', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ageBand: '45-54',
      visitPurpose: 'investment',
      marketInterests: ['new_apartments'],
      researchGoal: 'browse_offers',
      interestedWhere: 'yerevan',
      purchaseHorizon: '1-2_years',
      newsletter: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects market_research with more than 3 interests', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validMarketResearch,
      marketInterests: [
        'new_apartments',
        'houses_townhouses',
        'investment_opportunities',
        'foreign_property',
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects abroad interest without other text when other selected', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'abroad',
      abroadCountries: ['other'],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects house_townhouse without locationSeek', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'house_townhouse',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('FORM_VERSION', () => {
  it('is the active visitor registration version', () => {
    expect(FORM_VERSION).toBe('2026-vis-reg-v1');
  });
});
