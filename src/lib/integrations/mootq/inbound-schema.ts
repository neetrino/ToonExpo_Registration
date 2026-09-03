import { z } from 'zod';
import { MOOTQ_TICKET_PREFIX, isValidTicketCode } from '@/lib/tickets/ticket-code-format';
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@/lib/validation/constants';
import { normalizeEmail, normalizeName, trimEmail } from '@/lib/validation/normalize';
import { normalizePhone } from '@/lib/validation/phone';
import { MOOTQ_SOURCE_REGISTRATION_ID_MAX } from '@/lib/integrations/mootq/constants';

const localeSchema = z.enum(['hy', 'en', 'ru']);

export type MootqInboundAnswerValue = string | number | boolean | null | Array<string | number>;

export type MootqInboundAnswers = Record<string, MootqInboundAnswerValue>;

/**
 * Mootq → Toon Expo registration body (contract 16).
 * Rejects sourceSystem. Unknown answers keys are kept; nested objects are dropped.
 */
export const mootqInboundBodySchema = z
  .object({
    sourceRegistrationId: z
      .string()
      .trim()
      .min(1)
      .max(MOOTQ_SOURCE_REGISTRATION_ID_MAX)
      .regex(/^[\w.:-]+$/, 'Invalid sourceRegistrationId'),
    ticketCode: z
      .string()
      .refine((value) => isValidTicketCode(value) && value.startsWith(MOOTQ_TICKET_PREFIX), {
        message: 'Invalid ticketCode',
      }),
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
    locale: localeSchema,
    registeredAt: z.string().datetime({ offset: true }),
    answers: z.unknown().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const phone = normalizePhone(data.phone);
    if (!phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Invalid phone number',
      });
    }

    if (data.answers !== undefined && !isPlainObject(data.answers)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answers'],
        message: 'answers must be an object',
      });
    }
  })
  .transform((data) => {
    const phone = normalizePhone(data.phone);
    if (!phone) {
      throw new Error('Phone normalization failed after refine');
    }

    return {
      sourceRegistrationId: data.sourceRegistrationId,
      ticketCode: data.ticketCode,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      emailNormalized: normalizeEmail(data.email),
      phone: phone.phone,
      phoneNormalized: phone.phoneNormalized,
      locale: data.locale,
      registeredAt: new Date(data.registeredAt),
      answers: sanitizeInboundAnswers(data.answers),
    };
  });

export type MootqInboundBody = z.infer<typeof mootqInboundBodySchema>;

export function sanitizeInboundAnswers(value: unknown): MootqInboundAnswers | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isPlainObject(value)) {
    return undefined;
  }

  const sanitized: MootqInboundAnswers = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isAllowedAnswerValue(entry)) {
      sanitized[key] = entry;
    }
  }
  return sanitized;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAllowedAnswerValue(value: unknown): value is MootqInboundAnswerValue {
  if (value === null) {
    return true;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every((item) => typeof item === 'string' || typeof item === 'number');
}
