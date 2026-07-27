import { getPrisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { mapRegistrationError, type RegistrationAppError } from '@/lib/registrations/errors';
import { sendConfirmationEmail } from '@/lib/registrations/send-confirmation-email';
import { generateTicketCode, generateTicketViewToken } from '@/lib/tickets/codes';
import type { RegistrationBody } from '@/lib/validation';

const TICKET_CODE_INSERT_RETRIES = 5;

export type CreateRegistrationInput = Omit<RegistrationBody, 'website' | 'privacyConsent'> & {
  idempotencyKey: string;
};

export type CreateRegistrationSuccess = {
  ok: true;
  registrationId: string;
  ticketCode: string;
  ticketViewToken: string;
};

export type CreateRegistrationResult = CreateRegistrationSuccess | { ok: false; error: RegistrationAppError };

/**
 * Create a Toon Expo-origin registration with ticket code and hosted-ticket token.
 * Accidental retries with the same idempotency key return the existing ticket.
 */
export async function createRegistration(
  input: CreateRegistrationInput,
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

  const existing = await findByIdempotencyKey(activeEvent.id, input.idempotencyKey);
  if (existing) {
    return existing;
  }

  const created = await createWithTicketRetry(activeEvent.id, input);
  if (!created.ok) {
    return created;
  }

  await deliverConfirmationEmail({
    registrationId: created.registrationId,
    email: input.email,
    firstName: input.firstName,
    locale: input.locale,
  });

  return created;
}

async function findByIdempotencyKey(
  eventId: string,
  idempotencyKey: string,
): Promise<CreateRegistrationSuccess | null> {
  const prisma = getPrisma();

  try {
    const row = await prisma.registration.findFirst({
      where: { eventId, idempotencyKey },
      select: { id: true, ticketCode: true, ticketViewToken: true },
    });

    if (!row?.ticketCode || !row.ticketViewToken) {
      return null;
    }

    return {
      ok: true,
      registrationId: row.id,
      ticketCode: row.ticketCode,
      ticketViewToken: row.ticketViewToken,
    };
  } catch (error: unknown) {
    logger.error('Idempotency lookup failed', {
      code: mapRegistrationError(error).code,
    });
    return null;
  }
}

async function createWithTicketRetry(
  eventId: string,
  input: CreateRegistrationInput,
): Promise<CreateRegistrationResult> {
  const prisma = getPrisma();

  for (let attempt = 0; attempt < TICKET_CODE_INSERT_RETRIES; attempt += 1) {
    const ticketCode = generateTicketCode();
    const ticketViewToken = generateTicketViewToken();

    try {
      const created = await prisma.$transaction(async (tx) => {
        const registration = await tx.registration.create({
          data: {
            eventId,
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
            sourceSystem: 'TOON_EXPO',
            ticketCode,
            ticketViewToken,
            attendanceStatus: 'NOT_VISITED',
            idempotencyKey: input.idempotencyKey,
          },
          select: { id: true, ticketCode: true, ticketViewToken: true },
        });

        await tx.partnerFeedEvent.create({
          data: {
            registrationId: registration.id,
            type: 'UPSERT',
          },
        });

        return registration;
      });

      if (!created.ticketCode || !created.ticketViewToken) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', httpStatus: 500 } };
      }

      return {
        ok: true,
        registrationId: created.id,
        ticketCode: created.ticketCode,
        ticketViewToken: created.ticketViewToken,
      };
    } catch (error: unknown) {
      const mapped = mapRegistrationError(error);

      if (mapped.code === 'IDEMPOTENT_REPLAY') {
        const replay = await findByIdempotencyKey(eventId, input.idempotencyKey);
        if (replay) {
          return replay;
        }
      }

      if (mapped.code === 'TICKET_CODE_COLLISION' && attempt < TICKET_CODE_INSERT_RETRIES - 1) {
        continue;
      }

      if (mapped.code !== 'IDEMPOTENT_REPLAY') {
        logger.error('Registration create failed', { code: mapped.code });
      }

      return { ok: false, error: mapped };
    }
  }

  return { ok: false, error: { code: 'TICKET_CODE_COLLISION', httpStatus: 503 } };
}

async function deliverConfirmationEmail(params: {
  registrationId: string;
  email: string;
  firstName: string;
  locale: CreateRegistrationInput['locale'];
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
