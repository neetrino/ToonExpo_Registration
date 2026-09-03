import { describe, expect, it } from 'vitest';
import { flattenRegistrationAnswersForExport } from '@/lib/admin/export-answers';
import { CSV_ANSWER_COLUMNS } from '@/lib/admin/constants';

const ownResidenceAnswers = {
  ageBand: '25-34',
  visitPurpose: 'own_residence',
  interestType: 'house_townhouse',
  locationSeek: { scope: 'yerevan', districts: ['kentron', 'arabkir'] },
  areaSqm: '70-90',
  purchaseMethod: 'mortgage',
  monthlyBudget: '500k-700k',
  decisionStage: 'choosing_3_months',
  newsletter: true,
} as const;

describe('flattenRegistrationAnswersForExport', () => {
  it('flattens own_residence answers into English labels for en locale', () => {
    const result = flattenRegistrationAnswersForExport(ownResidenceAnswers, 'en');

    expect(result.visitPurpose).toBe('Purchasing real estate for personal residence');
    expect(result.ageBand).toBe('25–34');
    expect(result.interestType).toBe('Private house / Townhouse');
    expect(result.locationSeek).toBe('Yerevan');
    expect(result.yerevanDistricts).toBe('Kentron, Arabkir');
    expect(result.newsletter).toBe('Yes');
    expect(result.investmentGoal).toBe('');
    expect(Object.keys(result)).toHaveLength(CSV_ANSWER_COLUMNS.length);
  });

  it('flattens own_residence answers into Russian labels for ru locale', () => {
    const result = flattenRegistrationAnswersForExport(ownResidenceAnswers, 'ru');

    expect(result.visitPurpose).toBe('Покупка недвижимости для себя или семьи');
    expect(result.ageBand).toBe('25–34 года');
    expect(result.interestType).toBe('Частный дом / вилла / таунхаус');
    expect(result.locationSeek).toBe('Ереван');
    expect(result.newsletter).toBe('Да');
  });

  it('flattens own_residence answers into Armenian labels for hy locale', () => {
    const result = flattenRegistrationAnswersForExport(ownResidenceAnswers, 'hy');

    expect(result.visitPurpose).toBe('Անշարժ գույքի գնում սեփական բնակության համար');
    expect(result.interestType).toBe('Առանձնատուն / Թաունհաուս');
    expect(result.locationSeek).toBe('Երևան');
    expect(result.newsletter).toBe('Այո');
  });

  it('flattens investment answers and leaves residence columns empty', () => {
    const result = flattenRegistrationAnswersForExport(
      {
        ageBand: '35-44',
        visitPurpose: 'investment',
        investmentPropertyType: 'apartment',
        investmentMarket: 'armenia',
        investmentGoal: 'rental_income',
        investmentTimeline: '1_month',
        investmentBudgetUsd: '500k_plus',
        priorInvestmentExperience: 'yes',
        newsletter: false,
      },
      'en',
    );

    expect(result.visitPurpose).toBe('Interested in real estate investment');
    expect(result.investmentPropertyType).toBe('Apartment');
    expect(result.investmentMarket).toBe('Armenia');
    expect(result.interestType).toBe('');
    expect(result.newsletter).toBe('No');
  });

  it('returns empty columns for missing answers', () => {
    const result = flattenRegistrationAnswersForExport(null, 'en');
    expect(result.visitPurpose).toBe('');
    expect(result.ageBand).toBe('');
    expect(Object.values(result).every((value) => value === '')).toBe(true);
  });
});
