import type { Prisma } from '@/generated/prisma';

type RegistrationSearch = Prisma.RegistrationWhereInput;

function nameTokenWhere(token: string): RegistrationSearch {
  return {
    OR: [
      { firstName: { contains: token, mode: 'insensitive' } },
      { lastName: { contains: token, mode: 'insensitive' } },
    ],
  };
}

function singleFieldMatches(search: string): RegistrationSearch[] {
  const lowered = search.toLowerCase();
  return [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    { emailNormalized: { contains: lowered } },
    { phone: { contains: search } },
    { phoneNormalized: { contains: search } },
    { ticketCode: { contains: search } },
    { sourceRegistrationId: { contains: search } },
  ];
}

/**
 * Admin list filter.
 * One token matches any identity field.
 * Several tokens also match when each appears in the first or last name,
 * so "Narek Karapetyan" finds that registration in either name order.
 */
export function registrationSearchWhere(search: string | undefined): RegistrationSearch {
  if (!search) {
    return {};
  }

  const matches = singleFieldMatches(search);
  const tokens = search.split(/\s+/).filter((token) => token.length > 0);
  if (tokens.length > 1) {
    matches.push({ AND: tokens.map(nameTokenWhere) });
  }

  return { OR: matches };
}
