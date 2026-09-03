import { describe, expect, it } from 'vitest';
import { formatRegistrationAnswersForDisplay } from '@/lib/admin/format-answers';

describe('formatRegistrationAnswersForDisplay', () => {
  it('formats own_residence answers with English labels', () => {
    const result = formatRegistrationAnswersForDisplay({
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

    expect(result.visitPurposeLabel).toBe('Purchasing real estate for personal residence');
    expect(result.rows).toEqual(
      expect.arrayContaining([
        { label: 'Age', value: '25–34' },
        {
          label: 'What type of property are you interested in?',
          value: 'Private house / Townhouse',
        },
        { label: 'Where are you looking for real estate?', value: 'Yerevan' },
        { label: 'Yerevan', value: 'Kentron, Arabkir' },
        { label: 'What property size are you looking for?', value: '70–90 sq. m' },
        { label: 'How are you planning to purchase the property?', value: 'Mortgage' },
        {
          label: 'What monthly payment budget are you considering?',
          value: 'AMD 500,000–700,000',
        },
        {
          label: 'What stage are you currently at?',
          value: 'I have selected several options and plan to make a decision within 3 months',
        },
        {
          label:
            'Would you like to receive industry news, market analysis, and special offers after the exhibition?',
          value: 'Yes',
        },
      ]),
    );
  });

  it('formats locationSeek abroad with country text', () => {
    const result = formatRegistrationAnswersForDisplay({
      ageBand: '25-34',
      visitPurpose: 'own_residence',
      interestType: 'apartment_new',
      locationSeek: { scope: 'abroad', other: 'Portugal' },
      areaSqm: '70-90',
      purchaseMethod: 'mortgage',
      monthlyBudget: '500k-700k',
      decisionStage: 'choosing_3_months',
      newsletter: false,
    });

    expect(result.rows).toEqual(
      expect.arrayContaining([
        { label: 'Where are you looking for real estate?', value: 'Abroad' },
        { label: 'Please specify the country', value: 'Portugal' },
      ]),
    );
  });

  it('returns empty rows for missing answers', () => {
    expect(formatRegistrationAnswersForDisplay(null)).toEqual({
      visitPurposeLabel: null,
      rows: [],
    });
  });
});
