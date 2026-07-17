import { describe, expect, it } from 'vitest';
import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { CSV_ANSWER_COLUMNS } from '@/lib/admin/constants';

describe('flattenRegistrationAnswersForExport', () => {
  it('flattens own_residence answers into labeled columns', () => {
    const result = flattenRegistrationAnswersForExport({
      ageBand: '25-34',
      visitPurpose: 'own_residence',
      interestType: 'house_townhouse',
      locationSeek: { scope: 'yerevan', districts: ['kentron', 'arabkir'] },
      areaSqm: '70-90',
      purchaseMethod: 'mortgage',
      monthlyBudget: '500k-700k',
      decisionStage: 'choosing_3_months',
      newsletter: true,
    });

    expect(result.visitPurpose).toBe('Buying property for own residence');
    expect(result.ageBand).toBe('25–34 years');
    expect(result.interestType).toBe('House / townhouse');
    expect(result.locationSeek).toBe('Yerevan');
    expect(result.yerevanDistricts).toBe('Kentron, Arabkir');
    expect(result.newsletter).toBe('Yes');
    expect(result.investmentGoal).toBe('');
    expect(Object.keys(result)).toHaveLength(CSV_ANSWER_COLUMNS.length);
  });

  it('flattens investment answers and leaves residence columns empty', () => {
    const result = flattenRegistrationAnswersForExport({
      ageBand: '35-44',
      visitPurpose: 'investment',
      investmentPropertyType: 'apartment',
      investmentMarket: 'armenia',
      investmentGoal: 'rental_income',
      investmentTimeline: '1_month',
      investmentBudgetUsd: '500k_plus',
      priorInvestmentExperience: 'yes',
      newsletter: false,
    });

    expect(result.visitPurpose).toBe('Interested in investments');
    expect(result.investmentPropertyType).toBe('Apartment');
    expect(result.investmentMarket).toBe('Armenia');
    expect(result.interestType).toBe('');
    expect(result.newsletter).toBe('No');
  });

  it('returns empty columns for missing answers', () => {
    const result = flattenRegistrationAnswersForExport(null);
    expect(result.visitPurpose).toBe('');
    expect(result.ageBand).toBe('');
    expect(Object.values(result).every((value) => value === '')).toBe(true);
  });
});
