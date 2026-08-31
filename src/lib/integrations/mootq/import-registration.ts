import { getPrisma } from '@/lib/db/prisma';
import { MOOTQ_PRIVACY_POLICY_VERSION } from '@/lib/integrations/mootq/constants';
import type {
  MootqInboundAnswers,
  MootqInboundBody,
} from '@/lib/integrations/mootq/inbound-schema';
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

type ExistingMootqRegistration = {
  ticketCode: string | null;
  firstName: string;
  lastName: string;
  emailNormalized: string;
  phoneNormalized: string;
  locale: string;
  answers: unknown;
  createdAt: Date;
};

const existingReplaySelect = {
  ticketCode: true,
  firstName: true,
  lastName: true,
  emailNormalized: true,
  phoneNormalized: true,
  locale: true,
  answers: true,
  createdAt: true,
} as const;

/**
 * Persist a Mootq-origin registration with the exact supplied ticket code.
 * Stores only — does not create email or SMS jobs.
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
    return await persistMootqRegistration(activeEvent.id, input);
  } catch (error: unknown) {
    return handleImportError(input, error);
  }
}

async function persistMootqRegistration(
  eventId: string,
  input: MootqInboundBody,
): Promise<ImportMootqRegistrationResult> {
  const prisma = getPrisma();
  const existingBySource = await prisma.registration.findFirst({
    where: {
      sourceSystem: 'MOOTQ',
      sourceRegistrationId: input.sourceRegistrationId,
    },
    select: existingReplaySelect,
  });

  if (existingBySource) {
    if (isIdenticalReplay(existingBySource, input)) {
      return { ok: true, kind: 'replay' };
    }
    return { ok: false, code: 'CONFLICT', status: 409 };
  }

  const existingByCode = await prisma.registration.findFirst({
    where: { ticketCode: input.ticketCode },
    select: { id: true },
  });

  if (existingByCode) {
    return { ok: false, code: 'CONFLICT', status: 409 };
  }

  await prisma.registration.create({
    data: {
      eventId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      emailNormalized: input.emailNormalized,
      phone: input.phone,
      phoneNormalized: input.phoneNormalized,
      locale: input.locale,
      consentAcceptedAt: input.registeredAt,
      privacyPolicyVersion: MOOTQ_PRIVACY_POLICY_VERSION,
      emailDeliveryStatus: 'PENDING',
      sourceSystem: 'MOOTQ',
      sourceRegistrationId: input.sourceRegistrationId,
      ticketCode: input.ticketCode,
      ticketViewToken: generateTicketViewToken(),
      attendanceStatus: 'NOT_VISITED',
      createdAt: input.registeredAt,
      formVersion: extractFormVersion(input.answers),
      answers: input.answers,
    },
  });

  return { ok: true, kind: 'created' };
}

async function handleImportError(
  input: MootqInboundBody,
  error: unknown,
): Promise<ImportMootqRegistrationResult> {
  const mapped = mapRegistrationError(error);
  if (mapped.code === 'TICKET_CODE_COLLISION' || mapped.code === 'IDEMPOTENT_REPLAY') {
    const existingBySource = await getPrisma().registration.findFirst({
      where: {
        sourceSystem: 'MOOTQ',
        sourceRegistrationId: input.sourceRegistrationId,
      },
      select: existingReplaySelect,
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

function isIdenticalReplay(existing: ExistingMootqRegistration, input: MootqInboundBody): boolean {
  return (
    existing.ticketCode === input.ticketCode &&
    existing.firstName === input.firstName &&
    existing.lastName === input.lastName &&
    existing.emailNormalized === input.emailNormalized &&
    existing.phoneNormalized === input.phoneNormalized &&
    existing.locale === input.locale &&
    existing.createdAt.getTime() === input.registeredAt.getTime() &&
    jsonEqual(existing.answers, input.answers ?? null)
  );
}

function extractFormVersion(answers: MootqInboundAnswers | undefined): string | null {
  const value = answers?.form_version;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return (
    JSON.stringify(canonicalizeJson(left ?? null)) ===
    JSON.stringify(canonicalizeJson(right ?? null))
  );
}

function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = canonicalizeJson(record[key]);
  }
  return sorted;
}
