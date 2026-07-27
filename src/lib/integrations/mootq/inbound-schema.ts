import { z } from 'zod';
import { isValidTicketCode } from '@/lib/tickets/ticket-code-format';
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@/lib/validation/constants';
import { normalizeEmail, normalizeName, trimEmail } from '@/lib/validation/normalize';
import { normalizePhone } from '@/lib/validation/phone';
import { MOOTQ_SOURCE_REGISTRATION_ID_MAX } from '@/lib/integrations/mootq/constants';

const localeSchema = z.enum(['hy', 'en', 'ru']);

/**
 * Minimal Mootq inbound registration body (draft partner contract).
 * Rejects any attempt to supply sourceSystem.
 */
export const mootqInboundBodySchema = z
  .object({
    sourceRegistrationId: z
      .string()
      .trim()
      .min(1)
      .max(MOOTQ_SOURCE_REGISTRATION_ID_MAX)
      .regex(/^[\w.:-]+$/, 'Invalid sourceRegistrationId'),
    ticketCode: z.string().refine((value) => isValidTicketCode(value), {
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
    locale: localeSchema.optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
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
      locale: data.locale ?? ('hy' as const),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  });

export type MootqInboundBody = z.infer<typeof mootqInboundBodySchema>;
