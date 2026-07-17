import { z } from 'zod';
import type { CountryCode } from 'libphonenumber-js';
import { FORM_VERSION, questionnaireAnswersSchema } from '@/lib/questionnaire';
import {
  DEFAULT_PHONE_COUNTRY,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PRIVACY_POLICY_VERSION,
} from '@/lib/validation/constants';
import { normalizeEmail, normalizeName, trimEmail } from '@/lib/validation/normalize';
import { normalizePhone } from '@/lib/validation/phone';
import { isPhoneCountry } from '@/lib/validation/phone-countries';

const localeSchema = z.enum(['hy', 'en', 'ru']);

const phoneCountrySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value): value is CountryCode => isPhoneCountry(value), {
    message: 'Invalid phone country',
  })
  .optional()
  .default(DEFAULT_PHONE_COUNTRY);

/**
 * Raw registration body schema (pre-normalization transforms applied via Zod).
 * Identity fields are top-level; questionnaire fields live in `answers`.
 */
export const registrationBodySchema = z
  .object({
    firstName: z
      .string()
      .transform(normalizeName)
      .pipe(z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH)),
    lastName: z
      .string()
      .transform(normalizeName)
      .pipe(z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH)),
    email: z.string().transform(trimEmail).pipe(z.string().email().max(EMAIL_MAX_LENGTH)),
    phone: z.string().min(1).max(64),
    phoneCountry: phoneCountrySchema,
    locale: localeSchema,
    privacyConsent: z.literal(true),
    privacyPolicyVersion: z.literal(PRIVACY_POLICY_VERSION),
    website: z.string().max(200).optional().default(''),
    formVersion: z.literal(FORM_VERSION),
    answers: questionnaireAnswersSchema,
  })
  .superRefine((data, ctx) => {
    const phone = normalizePhone(data.phone, data.phoneCountry);
    if (!phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Invalid phone number',
      });
    }
  })
  .transform((data) => {
    const phone = normalizePhone(data.phone, data.phoneCountry);
    if (!phone) {
      throw new Error('Phone normalization failed after refine');
    }

    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      emailNormalized: normalizeEmail(data.email),
      phone: phone.phone,
      phoneNormalized: phone.phoneNormalized,
      locale: data.locale,
      privacyConsent: data.privacyConsent,
      privacyPolicyVersion: data.privacyPolicyVersion,
      website: data.website,
      formVersion: data.formVersion,
      answers: data.answers,
    };
  });

export type RegistrationBodyInput = z.input<typeof registrationBodySchema>;
export type RegistrationBody = z.output<typeof registrationBodySchema>;
