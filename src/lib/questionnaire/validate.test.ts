import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire/constants';
import {
  questionnaireAnswersSchema,
  storedQuestionnaireAnswersSchema,
} from '@/lib/questionnaire/validate';

const residence = { scope: 'yerevan' as const, district: 'kentron' as const };

const locationSeek = {
  yerevanDistricts: ['kentron', 'arabkir'] as const,
  marzRegions: [] as const,
  abroadCountries: [] as const,
};

const sharedOwnResidence = {
  ageBand: '35-44' as const,
  residence,
  visitPurpose: 'own_residence' as const,
  areaSqm: '70-90' as const,
  purchaseMethod: 'mortgage' as const,
  incomeTaxRefund: false,
  monthlyBudget: '300k-500k' as const,
  decisionStage: 'searching_6_months' as const,
  newsletter: true,
};

const validOwnResidence = {
  ...sharedOwnResidence,
  interestType: 'apartment_new' as const,
  locationSeek,
};

const validInvestment = {
  ageBand: '25-34' as const,
  residence,
  visitPurpose: 'investment' as const,
  investmentPropertyType: 'apartment' as const,
  locationSeek,
  investmentGoal: ['rental_income'] as const,
  areaSqm: '70-90' as const,
  purchaseMethod: 'cash' as const,
  investmentTimeline: '6-12_months' as const,
  investmentBudgetUsd: '150k-300k' as const,
  priorInvestmentExperience: 'no_first' as const,
  newsletter: false,
};

const validMarketResearch = {
  ageBand: '45-54' as const,
  residence,
  visitPurpose: 'market_research' as const,
  marketInterests: ['new_apartments', 'price_trends'] as const,
  researchGoal: 'browse_offers' as const,
  researchLocation: {
    undecided: false,
    yerevanDistricts: ['kentron'] as const,
    marzRegions: [] as const,
  },
  purchaseHorizon: '1-2_years' as const,
  newsletter: true,
};

describe('questionnaireAnswersSchema', () => {
  it('accepts own_residence happy path and drops a leftover newsletter answer', () => {
    const parsed = questionnaireAnswersSchema.safeParse(validOwnResidence);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('newsletter');
    }
  });

  it('accepts own_residence abroad interest with locationSeek', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'abroad',
      abroadCountries: ['uae', 'other'],
      abroadCountriesOther: 'Portugal',
      locationSeek,
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
      ...validOwnResidence,
      visitPurpose: 'investment',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects investment-only payload when visitPurpose is own_residence', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validInvestment,
      visitPurpose: 'own_residence',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects market_research-only payload when visitPurpose is investment', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validMarketResearch,
      visitPurpose: 'investment',
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
      locationSeek,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects house_townhouse without locationSeek leaves', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'house_townhouse',
      locationSeek: {
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountries: [],
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts locationSeek abroad with country codes', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'apartment_new',
      locationSeek: {
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountries: ['italy', 'other'],
        abroadCountriesOther: 'Portugal',
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects locationSeek abroad without other text when other selected', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'apartment_new',
      locationSeek: {
        yerevanDistricts: [],
        marzRegions: [],
        abroadCountries: ['other'],
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects locationSeek that mixes Yerevan and marz', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...sharedOwnResidence,
      interestType: 'apartment_new',
      locationSeek: {
        yerevanDistricts: ['kentron'],
        marzRegions: ['kotayk'],
        abroadCountries: [],
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects research location that mixes Yerevan and abroad', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: ['kentron'],
        marzRegions: [],
        abroadCountry: 'UAE',
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects research location with more than 3 leaves', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validMarketResearch,
      researchLocation: {
        undecided: false,
        yerevanDistricts: ['kentron', 'arabkir', 'ajapnyak', 'davtashen'],
        marzRegions: [],
      },
    });
    expect(parsed.success).toBe(false);
  });

  it('requires residence on every branch', () => {
    const parsed = questionnaireAnswersSchema.safeParse({
      ...validOwnResidence,
      residence: undefined,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('FORM_VERSION', () => {
  it('is the active visitor registration version', () => {
    expect(FORM_VERSION).toBe('2026-vis-reg-v2');
  });
});

describe('October 2026 questionnaire revision', () => {
  it.each([true, false])(
    'requires and preserves the mortgage refund answer %s',
    (incomeTaxRefund) => {
      expect(
        questionnaireAnswersSchema.parse({ ...validOwnResidence, incomeTaxRefund }),
      ).toMatchObject({ incomeTaxRefund });
      expect(
        questionnaireAnswersSchema.safeParse({ ...validOwnResidence, incomeTaxRefund: undefined })
          .success,
      ).toBe(false);
      expect(
        questionnaireAnswersSchema.safeParse({
          ...validInvestment,
          purchaseMethod: 'mortgage',
          incomeTaxRefund,
        }).success,
      ).toBe(true);
      expect(
        questionnaireAnswersSchema.safeParse({ ...validInvestment, purchaseMethod: 'mortgage' })
          .success,
      ).toBe(false);
    },
  );

  it.each(['cash', 'installment'])(
    'does not accept a mortgage-only answer for %s',
    (purchaseMethod) => {
      expect(
        questionnaireAnswersSchema.safeParse({
          ...validOwnResidence,
          purchaseMethod,
          incomeTaxRefund: undefined,
        }).success,
      ).toBe(true);
      expect(
        questionnaireAnswersSchema.safeParse({
          ...validOwnResidence,
          purchaseMethod,
          incomeTaxRefund: false,
        }).success,
      ).toBe(false);
    },
  );

  it('removes the combined payment method', () => {
    expect(
      questionnaireAnswersSchema.safeParse({ ...validOwnResidence, purchaseMethod: 'mixed' })
        .success,
    ).toBe(false);
  });

  it('allows all four investment goals and rejects empty, repeated and obsolete choices', () => {
    const investmentGoal = [
      'rental_income',
      'appreciation',
      'diversification',
      'citizenship_residency',
    ];
    expect(questionnaireAnswersSchema.parse({ ...validInvestment, investmentGoal })).toMatchObject({
      investmentGoal,
    });
    for (const invalid of [[], ['rental_income', 'rental_income'], ['multiple'], 'rental_income']) {
      expect(
        questionnaireAnswersSchema.safeParse({ ...validInvestment, investmentGoal: invalid })
          .success,
      ).toBe(false);
    }
  });

  it.each([
    ['own_residence', 'aragatsotn', 'ashtarak'],
    ['own_residence', 'ararat', 'masis'],
    ['own_residence', 'kotayk', 'kanakeravan'],
    ['investment', 'kotayk', 'tsaghkadzor'],
    ['investment', 'kotayk', 'yeghvard'],
    ['investment', 'tavush', 'dilijan'],
  ])('validates %s city %s/%s in its own branch', (purpose, region, city) => {
    const base = purpose === 'investment' ? validInvestment : validOwnResidence;
    const locationSeek = {
      yerevanDistricts: [],
      marzRegions: [region],
      abroadCountries: [],
      marzCities: { [region]: { city } },
    };
    expect(questionnaireAnswersSchema.safeParse({ ...base, locationSeek }).success).toBe(true);
    expect(
      questionnaireAnswersSchema.safeParse({
        ...base,
        locationSeek: { ...locationSeek, marzCities: undefined },
      }).success,
    ).toBe(false);
  });

  it('does not ask for cities in residence or research and rejects cities from another branch', () => {
    expect(
      questionnaireAnswersSchema.safeParse({
        ...validOwnResidence,
        residence: { scope: 'marz', region: 'kotayk' },
      }).success,
    ).toBe(true);
    expect(
      questionnaireAnswersSchema.safeParse({
        ...validMarketResearch,
        researchLocation: { undecided: false, yerevanDistricts: [], marzRegions: ['kotayk'] },
      }).success,
    ).toBe(true);
    expect(
      questionnaireAnswersSchema.safeParse({
        ...validOwnResidence,
        locationSeek: {
          yerevanDistricts: [],
          marzRegions: ['kotayk'],
          abroadCountries: [],
          marzCities: { kotayk: { city: 'tsaghkadzor' } },
        },
      }).success,
    ).toBe(false);
    expect(
      questionnaireAnswersSchema.safeParse({
        ...validInvestment,
        locationSeek: {
          yerevanDistricts: [],
          marzRegions: ['kotayk'],
          abroadCountries: [],
          marzCities: { kotayk: { city: 'kanakeravan' } },
        },
      }).success,
    ).toBe(false);
  });

  it('keeps historical single goals, combined payments and missing refund answers readable without inventing answers', () => {
    const legacy = { ...validInvestment, investmentGoal: 'multiple', purchaseMethod: 'mixed' };
    expect(storedQuestionnaireAnswersSchema.parse(legacy)).toMatchObject({
      investmentGoal: 'multiple',
      purchaseMethod: 'mixed',
    });
    const oldMortgage = storedQuestionnaireAnswersSchema.parse({
      ...validOwnResidence,
      incomeTaxRefund: undefined,
    });
    expect(oldMortgage).not.toHaveProperty('incomeTaxRefund', false);
    expect(oldMortgage).not.toHaveProperty('incomeTaxRefund', true);
  });
});
