import type { Prisma } from '@/generated/prisma';
import { getPrisma } from '@/lib/db';
import { ADMIN_PAGE_SIZE, ADMIN_SEARCH_MAX_LENGTH } from '@/lib/admin/constants';

export type AdminRegistrationRow = {
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
};

export type AdminListResult = {
  event: { id: string; name: string; slug: string } | null;
  totalCount: number;
  filteredCount: number;
  page: number;
  pageSize: number;
  rows: AdminRegistrationRow[];
};

function normalizeSearch(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim().slice(0, ADMIN_SEARCH_MAX_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildSearchWhere(
  eventId: string,
  search: string | undefined,
): Prisma.RegistrationWhereInput {
  if (!search) {
    return { eventId };
  }

  const lowered = search.toLowerCase();

  return {
    eventId,
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { emailNormalized: { contains: lowered } },
      { phone: { contains: search } },
      { phoneNormalized: { contains: search } },
    ],
  };
}

/**
 * Load active-event registration summary and a paginated page (newest first).
 */
export async function listAdminRegistrations(options: {
  page?: number;
  search?: string;
  pageSize?: number;
}): Promise<AdminListResult> {
  const prisma = getPrisma();
  const pageSize = options.pageSize ?? ADMIN_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);
  const search = normalizeSearch(options.search);

  const event = await prisma.event.findFirst({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!event) {
    return {
      event: null,
      totalCount: 0,
      filteredCount: 0,
      page,
      pageSize,
      rows: [],
    };
  }

  const where = buildSearchWhere(event.id, search);

  const [totalCount, filteredCount, rows] = await Promise.all([
    prisma.registration.count({ where: { eventId: event.id } }),
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    }),
  ]);

  return {
    event,
    totalCount,
    filteredCount,
    page,
    pageSize,
    rows,
  };
}

/**
 * Fetch all matching registrations for CSV export (bounded by active event + search).
 */
export async function listRegistrationsForExport(search?: string): Promise<{
  event: { id: string; name: string; slug: string } | null;
  rows: AdminRegistrationRow[];
}> {
  const prisma = getPrisma();
  const normalizedSearch = normalizeSearch(search);

  const event = await prisma.event.findFirst({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!event) {
    return { event: null, rows: [] };
  }

  const rows = await prisma.registration.findMany({
    where: buildSearchWhere(event.id, normalizedSearch),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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

  return { event, rows };
}
