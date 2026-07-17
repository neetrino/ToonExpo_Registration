import { describe, expect, it } from 'vitest';
import { FORM_VERSION } from '@/lib/questionnaire';
import { normalizeEmail, normalizeName } from '@/lib/validation/normalize';
import { normalizePhone } from '@/lib/validation/phone';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation/constants';
import { registrationBodySchema } from '@/lib/validation/registration-schema';

const validAnswers = {
  ageBand: '35-44' as const,
  visitPurpose: 'own_residence' as const,
  interestType: 'apartment_new' as const,
  locationSeek: {
    scope: 'yerevan' as const,
    districts: ['kentron'] as const,
  },
  areaSqm: '70-90' as const,
  purchaseMethod: 'mortgage' as const,
  monthlyBudget: '300k-500k' as const,
  decisionStage: 'searching_6_months' as const,
  newsletter: true,
};

describe('normalizeName', () => {
  it('trims and collapses whitespace without changing case or script', () => {
    expect(normalizeName('  Աննա   Մարիա  ')).toBe('Աննա Մարիա');
    expect(normalizeName('Jean-Luc')).toBe('Jean-Luc');
    expect(normalizeName('  Олег  ')).toBe('Олег');
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases the full value', () => {
    expect(normalizeEmail('  User+Tag@Example.COM  ')).toBe('user+tag@example.com');
  });
});

describe('normalizePhone', () => {
  it('defaults Armenia and formats E.164', () => {
    const result = normalizePhone('99123456');
    expect(result).not.toBeNull();
    expect(result?.phoneNormalized).toBe('+37499123456');
  });

  it('accepts international numbers', () => {
    const result = normalizePhone('+12025550123');
    expect(result).not.toBeNull();
    expect(result?.phoneNormalized).toBe('+12025550123');
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhone('not-a-phone')).toBeNull();
  });
});

describe('registrationBodySchema', () => {
  const valid = {
    firstName: '  Anna  ',
    lastName: 'Sargsyan',
    email: '  Anna@Example.com ',
    phone: '99123456',
    locale: 'hy' as const,
    privacyConsent: true as const,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    website: '',
    formVersion: FORM_VERSION,
    answers: validAnswers,
  };

  it('accepts and normalizes a valid payload', () => {
    const parsed = registrationBodySchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }
    expect(parsed.data.firstName).toBe('Anna');
    expect(parsed.data.email).toBe('Anna@Example.com');
    expect(parsed.data.emailNormalized).toBe('anna@example.com');
    expect(parsed.data.phoneNormalized).toBe('+37499123456');
    expect(parsed.data.formVersion).toBe(FORM_VERSION);
    expect(parsed.data.answers.visitPurpose).toBe('own_residence');
  });

  it('rejects missing consent', () => {
    const parsed = registrationBodySchema.safeParse({ ...valid, privacyConsent: false });
    expect(parsed.success).toBe(false);
  });

  it('rejects unknown privacy policy version', () => {
    const parsed = registrationBodySchema.safeParse({
      ...valid,
      privacyPolicyVersion: '1999-01-01',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const parsed = registrationBodySchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing questionnaire answers', () => {
    const withoutAnswers = Object.fromEntries(
      Object.entries(valid).filter(([key]) => key !== 'answers'),
    );
    const parsed = registrationBodySchema.safeParse(withoutAnswers);
    expect(parsed.success).toBe(false);
  });

  it('rejects wrong formVersion', () => {
    const parsed = registrationBodySchema.safeParse({
      ...valid,
      formVersion: 'legacy',
    });
    expect(parsed.success).toBe(false);
  });
});
