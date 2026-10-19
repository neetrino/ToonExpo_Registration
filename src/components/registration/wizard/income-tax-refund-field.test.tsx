import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IncomeTaxRefundField } from './income-tax-refund-field';
import { getQuestionLabel } from './labels';

afterEach(cleanup);

describe('income tax refund field', () => {
  it.each(['hy', 'en', 'ru'] as const)(
    'renders translated mortgage answers and can clear a selection in %s',
    (locale) => {
      const onChange = vi.fn();
      render(
        <IncomeTaxRefundField
          locale={locale}
          purchaseMethod="mortgage"
          value={false}
          disabled={false}
          onChange={onChange}
        />,
      );
      expect(screen.getByText(getQuestionLabel('incomeTaxRefund', locale))).toBeDefined();
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
      fireEvent.click(radios[0]);
      expect(onChange).toHaveBeenLastCalledWith(true);
      fireEvent.click(radios[1]);
      expect(onChange).toHaveBeenLastCalledWith('');
    },
  );
  it.each(['cash', 'installment', ''])('hides mortgage-only answers for %s', (purchaseMethod) => {
    render(
      <IncomeTaxRefundField
        locale="ru"
        purchaseMethod={purchaseMethod}
        value={true}
        disabled={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('radio')).toBeNull();
  });
});
