import { getPrisma } from '@/lib/db/prisma';
import { DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE } from '@/lib/delivery/constants';
import { createTicketDeliveryJobs } from '@/lib/delivery/create-ticket-delivery-jobs';
import { processDueDeliveryJobs } from '@/lib/delivery/process-delivery-jobs';
import { MOOTQ_PRIVACY_POLICY_VERSION } from '@/lib/integrations/mootq/constants';
import type { MootqInboundBody } from '@/lib/integrations/mootq/inbound-schema';
import { logger } from '@/lib/logger';
import { mapRegistrationError } from '@/lib/registrations/errors';
import { generateTicketViewToken } from '@/lib/tickets/codes';

export type ImportMootqRegistrationResult =
  | { ok: true; kind: 'created' | 'replay' }
  | {
      ok: false;
      code: 'NO_ACTIVE_EVENT' | 'CONFLICT' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';
      status: 409 | 500 | 503;
    };

/**
 * Persist a Mootq-origin registration with the exact supplied ticket code.
 * Transport idempotency is by (MOOTQ, sourceRegistrationId).
 */
export async function importMootqRegistration(
  input: MootqInboundBody,
): Promise<ImportMootqRegistrationResult> {
  const prisma = getPrisma();

  let activeEvent: { id: string } | null;
  try {
    activeEvent = await prisma.event.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
  } catch (error: unknown) {
    logger.error('Mootq import: failed to resolve active event', {
      code: mapRegistrationError(error).code,
    });
    return { ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 };
  }

  if (!activeEvent) {
    return { ok: false, code: 'NO_ACTIVE_EVENT', status: 503 };
  }

  try {
    const existingBySource = await prisma.registration.findFirst({
      where: {
        sourceSystem: 'MOOTQ',
        sourceRegistrationId: input.sourceRegistrationId,
      },
      select: {
        id: true,
        ticketCode: true,
        firstName: true,
        lastName: true,
        emailNormalized: true,
        phoneNormalized: true,
      },
    });

    if (existingBySource) {
      if (isIdenticalReplay(existingBySource, input)) {
        return { ok: true, kind: 'replay' };
      }
      return { ok: false, code: 'CONFLICT', status: 409 };
    }

    const existingByCode = await prisma.registration.findFirst({
      where: { ticketCode: input.ticketCode },
      select: { id: true, sourceSystem: true, sourceRegistrationId: true },
    });

    if (existingByCode) {
      return { ok: false, code: 'CONFLICT', status: 409 };
    }

    const created = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          eventId: activeEvent.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          emailNormalized: input.emailNormalized,
          phone: input.phone,
          phoneNormalized: input.phoneNormalized,
          locale: input.locale,
          consentAcceptedAt: input.createdAt ?? new Date(),
          privacyPolicyVersion: MOOTQ_PRIVACY_POLICY_VERSION,
          emailDeliveryStatus: 'PENDING',
          sourceSystem: 'MOOTQ',
          sourceRegistrationId: input.sourceRegistrationId,
          ticketCode: input.ticketCode,
          ticketViewToken: generateTicketViewToken(),
          attendanceStatus: 'NOT_VISITED',
          ...(input.createdAt ? { createdAt: input.createdAt } : {}),
        },
        select: { id: true },
      });

      await createTicketDeliveryJobs(tx, registration.id);

      return registration;
    });

    try {
      await processDueDeliveryJobs({
        registrationId: created.id,
        limit: DELIVERY_CLAIM_BATCH_SIZE_AFTER_CREATE,
      });
    } catch (error: unknown) {
      logger.error('Mootq import: delivery processing failed', {
        registrationId: created.id,
        code: mapRegistrationError(error).code,
      });
    }

    return { ok: true, kind: 'created' };
  } catch (error: unknown) {
    const mapped = mapRegistrationError(error);
    if (mapped.code === 'TICKET_CODE_COLLISION' || mapped.code === 'IDEMPOTENT_REPLAY') {
      const existingBySource = await getPrisma().registration.findFirst({
        where: {
          sourceSystem: 'MOOTQ',
          sourceRegistrationId: input.sourceRegistrationId,
        },
        select: {
          ticketCode: true,
          firstName: true,
          lastName: true,
          emailNormalized: true,
          phoneNormalized: true,
        },
      });
      if (existingBySource && isIdenticalReplay(existingBySource, input)) {
        return { ok: true, kind: 'replay' };
      }
      return { ok: false, code: 'CONFLICT', status: 409 };
    }
    if (mapped.code === 'SERVICE_UNAVAILABLE') {
      return { ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 };
    }
    logger.error('Mootq import failed', { code: mapped.code });
    return { ok: false, code: 'INTERNAL_ERROR', status: 500 };
  }
}

function isIdenticalReplay(
  existing: {
    ticketCode: string | null;
    firstName: string;
    lastName: string;
    emailNormalized: string;
    phoneNormalized: string;
  },
  input: MootqInboundBody,
): boolean {
  return (
    existing.ticketCode === input.ticketCode &&
    existing.firstName === input.firstName &&
    existing.lastName === input.lastName &&
    existing.emailNormalized === input.emailNormalized &&
    existing.phoneNormalized === input.phoneNormalized
  );
}
