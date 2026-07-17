import { getPrisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { mapRegistrationError, type RegistrationAppError } from '@/lib/registrations/errors';
import { sendConfirmationEmail } from '@/lib/registrations/send-confirmation-email';
import type { RegistrationBody } from '@/lib/validation';

export type CreateRegistrationResult =
  { ok: true; registrationId: string } | { ok: false; error: RegistrationAppError };

/**
 * Create a registration for the active event, then attempt confirmation email outside the DB write.
 */
export async function createRegistration(
  input: Omit<RegistrationBody, 'website' | 'privacyConsent'>,
): Promise<CreateRegistrationResult> {
  const prisma = getPrisma();

  let activeEvent: { id: string } | null;
  try {
    activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
  } catch (error: unknown) {
    logger.error('Failed to resolve active event', {
      code: mapRegistrationError(error).code,
    });
    return { ok: false, error: mapRegistrationError(error) };
  }

  if (!activeEvent) {
    return { ok: false, error: { code: 'NO_ACTIVE_EVENT', httpStatus: 503 } };
  }

  let registrationId: string;

  try {
    const created = await prisma.registration.create({
      data: {
        eventId: activeEvent.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        emailNormalized: input.emailNormalized,
        phone: input.phone,
        phoneNormalized: input.phoneNormalized,
        locale: input.locale,
        consentAcceptedAt: new Date(),
        privacyPolicyVersion: input.privacyPolicyVersion,
        formVersion: input.formVersion,
        answers: input.answers,
        emailDeliveryStatus: 'PENDING',
      },
      select: { id: true },
    });
    registrationId = created.id;
  } catch (error: unknown) {
    const mapped = mapRegistrationError(error);
    if (mapped.code !== 'DUPLICATE_EMAIL') {
      logger.error('Registration create failed', { code: mapped.code });
    }
    return { ok: false, error: mapped };
  }

  await deliverConfirmationEmail({
    registrationId,
    email: input.email,
    firstName: input.firstName,
    locale: input.locale,
  });

  return { ok: true, registrationId };
}

async function deliverConfirmationEmail(params: {
  registrationId: string;
  email: string;
  firstName: string;
  locale: RegistrationBody['locale'];
}): Promise<void> {
  const prisma = getPrisma();
  const result = await sendConfirmationEmail(params);
  const attemptedAt = new Date();

  try {
    if (result.ok) {
      await prisma.registration.update({
        where: { id: params.registrationId },
        data: {
          emailDeliveryStatus: 'SENT',
          emailLastAttemptAt: attemptedAt,
          emailProviderMessageId: result.messageId ?? null,
        },
      });
      return;
    }

    await prisma.registration.update({
      where: { id: params.registrationId },
      data: {
        emailDeliveryStatus: 'FAILED',
        emailLastAttemptAt: attemptedAt,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to update email delivery status', {
      registrationId: params.registrationId,
      code: mapRegistrationError(error).code,
    });
  }
}
