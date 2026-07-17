import { getPrisma } from '@/lib/db';

export type AdminRegistrationDetail = {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: string;
  emailDeliveryStatus: string;
  formVersion: string | null;
  answers: unknown;
  consentAcceptedAt: Date;
  privacyPolicyVersion: string;
  event: { id: string; name: string; slug: string };
};

/**
 * Load one registration for the active event, or null when missing / no active event.
 */
export async function getAdminRegistration(
  registrationId: string,
): Promise<AdminRegistrationDetail | null> {
  const prisma = getPrisma();

  const event = await prisma.event.findFirst({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!event) {
    return null;
  }

  const row = await prisma.registration.findFirst({
    where: { id: registrationId, eventId: event.id },
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      locale: true,
      emailDeliveryStatus: true,
      formVersion: true,
      answers: true,
      consentAcceptedAt: true,
      privacyPolicyVersion: true,
    },
  });

  if (!row) {
    return null;
  }

  return { ...row, event };
}
