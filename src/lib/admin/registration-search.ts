import type { Prisma } from '@/generated/prisma';

type RegistrationSearch = Prisma.RegistrationWhereInput;

/** Ignore 1-digit noise such as a stray "1" inside every phone number. */
const MIN_PHONE_DIGITS = 2;

/** Punctuation around a word. Dots stay in the middle so emails keep their domain. */
const TOKEN_EDGE = /^[^\p{L}\p{N}+@]+|[^\p{L}\p{N}+@]+$/gu;

type SearchToken = {
  raw: string;
  lowered: string;
  digits: string;
};

function cleanToken(raw: string): string {
  return raw.replace(TOKEN_EDGE, '');
}

function parseSearchTokens(search: string): SearchToken[] {
  const tokens: SearchToken[] = [];

  for (const part of search.split(/\s+/)) {
    const raw = cleanToken(part);
    if (!raw || raw === '+') {
      continue;
    }

    tokens.push({
      raw,
      lowered: raw.toLowerCase(),
      digits: raw.replace(/\D/g, ''),
    });
  }

  return tokens;
}

function phoneMatches(token: SearchToken): RegistrationSearch[] {
  if (token.digits.length < MIN_PHONE_DIGITS || /\p{L}/u.test(token.raw)) {
    return [];
  }

  return [{ phone: { contains: token.raw } }, { phoneNormalized: { contains: token.digits } }];
}

function tokenMatches(token: SearchToken): RegistrationSearch {
  return {
    OR: [
      { firstName: { contains: token.raw, mode: 'insensitive' } },
      { lastName: { contains: token.raw, mode: 'insensitive' } },
      { email: { contains: token.raw, mode: 'insensitive' } },
      { emailNormalized: { contains: token.lowered } },
      ...phoneMatches(token),
      { ticketCode: { contains: token.raw, mode: 'insensitive' } },
      { sourceRegistrationId: { contains: token.raw, mode: 'insensitive' } },
    ],
  };
}

/**
 * Admin registration search.
 * Every word must match a name, email, phone, ticket code, or source id.
 * Phone formatting (spaces, dashes, parentheses) is ignored.
 * Ticket codes and source ids are case-insensitive.
 */
export function registrationSearchWhere(search: string | undefined): RegistrationSearch {
  if (!search) {
    return {};
  }

  const tokens = parseSearchTokens(search);
  if (tokens.length === 0) {
    return {};
  }

  if (tokens.length === 1) {
    return tokenMatches(tokens[0]);
  }

  return { AND: tokens.map(tokenMatches) };
}
