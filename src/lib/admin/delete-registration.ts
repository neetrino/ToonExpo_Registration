import { getPrisma } from '@/lib/db';

export type DeleteRegistrationResult =
  { ok: true } | { ok: false; code: 'NOT_FOUND' | 'NO_ACTIVE_EVENT' };

/**
 * Hard-delete one registration belonging to the active event.
 */
export async function deleteRegistration(
  registrationId: string,
): Promise<DeleteRegistrationResult> {
  const prisma = getPrisma();

  const event = await prisma.event.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  if (!event) {
    return { ok: false, code: 'NO_ACTIVE_EVENT' };
  }

  const existing = await prisma.registration.findFirst({
    where: { id: registrationId, eventId: event.id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.registration.delete({ where: { id: registrationId } });
  return { ok: true };
}
