import { getPrisma } from '@/lib/db';

export type AdminDeliveryJobSummary = {
  channel: string;
  status: string;
  attemptCount: number;
  lastErrorCode: string | null;
  nextAttemptAt: Date;
  sentAt: Date | null;
  updatedAt: Date;
};

export type AdminRegistrationDetail = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locale: string;
  emailDeliveryStatus: string;
  emailLastAttemptAt: Date | null;
  sourceSystem: string | null;
  sourceRegistrationId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ticketCode: string | null;
  ticketViewToken: string | null;
  attendanceStatus: string | null;
  formVersion: string | null;
  answers: unknown;
  consentAcceptedAt: Date;
  privacyPolicyVersion: string;
  deliveryJobs: AdminDeliveryJobSummary[];
  event: { id: string; name: string; slug: string };
};

/**
 * Load one registration for the active event, or null when missing / no active event.
 * Includes ticket/source fields and delivery job summaries. Never expose secrets in UI copy.
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
      updatedAt: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      locale: true,
      emailDeliveryStatus: true,
      emailLastAttemptAt: true,
      sourceSystem: true,
      sourceRegistrationId: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      ticketCode: true,
      ticketViewToken: true,
      attendanceStatus: true,
      formVersion: true,
      answers: true,
      consentAcceptedAt: true,
      privacyPolicyVersion: true,
      deliveryJobs: {
        orderBy: { createdAt: 'asc' },
        select: {
          channel: true,
          status: true,
          attemptCount: true,
          lastErrorCode: true,
          nextAttemptAt: true,
          sentAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return { ...row, event };
}
