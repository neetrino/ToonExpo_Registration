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

    expect(result.visitPurposeLabel).toBe('Buying property for own residence');
    expect(result.rows).toEqual(
      expect.arrayContaining([
        { label: 'Age', value: '25–34 years' },
        { label: 'What are you interested in?', value: 'House / townhouse' },
        { label: 'Where are you looking for real estate?', value: 'Yerevan' },
        { label: 'Yerevan — district', value: 'Kentron, Arabkir' },
        { label: 'Would you like to receive industry news, analysis, and special offers after the exhibition?', value: 'Yes' },
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
