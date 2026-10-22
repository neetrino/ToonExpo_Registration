import { describe, expect, it } from 'vitest';
import { adoptAutofilledPhoneDigits } from './adopt-autofilled-phone';

describe('adoptAutofilledPhoneDigits', () => {
  it('stores an Armenian autofill as national digits', () => {
    expect(adoptAutofilledPhoneDigits('95117710', 'AM', '')).toBe('95117710');
    expect(adoptAutofilledPhoneDigits('+374 95 117710', 'AM', '')).toBe('95117710');
    expect(adoptAutofilledPhoneDigits('095117710', 'AM', '')).toBe('95117710');
  });

  it('stores a Russian autofill as ten national digits', () => {
    expect(adoptAutofilledPhoneDigits('+7 (965) 300-55-12', 'RU', '')).toBe('9653005512');
    expect(adoptAutofilledPhoneDigits('89993005512', 'RU', '')).toBe('9993005512');
  });

  it('leaves the field alone when it already shows the formatted number', () => {
    expect(adoptAutofilledPhoneDigits('(95) 11-77-10', 'AM', '95117710')).toBeNull();
    expect(adoptAutofilledPhoneDigits('95117710', 'AM', '95117710')).toBeNull();
  });

  it('does not clear a stored number when the painted value has no digits', () => {
    expect(adoptAutofilledPhoneDigits('', 'AM', '95117710')).toBeNull();
    expect(adoptAutofilledPhoneDigits('   ', 'AM', '95117710')).toBeNull();
  });
});
