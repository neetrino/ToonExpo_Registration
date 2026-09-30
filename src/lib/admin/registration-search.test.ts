import { describe, expect, it } from 'vitest';
import { registrationSearchWhere } from '@/lib/admin/registration-search';

describe('registrationSearchWhere', () => {
  it('returns no filter when the query is empty or only punctuation', () => {
    expect(registrationSearchWhere(undefined)).toEqual({});
    expect(registrationSearchWhere('...')).toEqual({});
  });

  it('matches one word across name, email, and ticket code', () => {
    expect(registrationSearchWhere('Narek')).toEqual({
      OR: [
        { firstName: { contains: 'Narek', mode: 'insensitive' } },
        { lastName: { contains: 'Narek', mode: 'insensitive' } },
        { email: { contains: 'Narek', mode: 'insensitive' } },
        { emailNormalized: { contains: 'narek' } },
        { ticketCode: { contains: 'Narek', mode: 'insensitive' } },
        { sourceRegistrationId: { contains: 'Narek', mode: 'insensitive' } },
      ],
    });
  });

  it('requires every word of a full name to match', () => {
    expect(registrationSearchWhere('Narek Karapetyan')).toEqual({
      AND: [registrationSearchWhere('Narek'), registrationSearchWhere('Karapetyan')],
    });
    expect(registrationSearchWhere('Karapetyan Narek')).toEqual({
      AND: [registrationSearchWhere('Karapetyan'), registrationSearchWhere('Narek')],
    });
  });

  it('splits Armenian names and ignores extra spaces and a trailing comma', () => {
    expect(registrationSearchWhere('Վահան   Թեստային,')).toEqual({
      AND: [registrationSearchWhere('Վահան'), registrationSearchWhere('Թեստային')],
    });
  });

  it('matches a phone number by its digits when the query has spaces or dashes', () => {
    expect(registrationSearchWhere('+374 43 494449')).toEqual({
      AND: [
        registrationSearchWhere('+374'),
        registrationSearchWhere('43'),
        registrationSearchWhere('494449'),
      ],
    });
    expect(registrationSearchWhere('374-43-494449')).toEqual({
      OR: [
        { firstName: { contains: '374-43-494449', mode: 'insensitive' } },
        { lastName: { contains: '374-43-494449', mode: 'insensitive' } },
        { email: { contains: '374-43-494449', mode: 'insensitive' } },
        { emailNormalized: { contains: '374-43-494449' } },
        { phone: { contains: '374-43-494449' } },
        { phoneNormalized: { contains: '37443494449' } },
        { ticketCode: { contains: '374-43-494449', mode: 'insensitive' } },
        { sourceRegistrationId: { contains: '374-43-494449', mode: 'insensitive' } },
      ],
    });
  });

  it('matches a ticket code without caring about letter case', () => {
    expect(registrationSearchWhere('texx015w82dq')).toEqual({
      OR: [
        { firstName: { contains: 'texx015w82dq', mode: 'insensitive' } },
        { lastName: { contains: 'texx015w82dq', mode: 'insensitive' } },
        { email: { contains: 'texx015w82dq', mode: 'insensitive' } },
        { emailNormalized: { contains: 'texx015w82dq' } },
        { ticketCode: { contains: 'texx015w82dq', mode: 'insensitive' } },
        { sourceRegistrationId: { contains: 'texx015w82dq', mode: 'insensitive' } },
      ],
    });
  });
});
