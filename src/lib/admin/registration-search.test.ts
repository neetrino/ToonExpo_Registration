import { describe, expect, it } from 'vitest';
import { registrationSearchWhere } from '@/lib/admin/registration-search';

describe('registrationSearchWhere', () => {
  it('returns no filter when the query is empty', () => {
    expect(registrationSearchWhere(undefined)).toEqual({});
  });

  it('keeps a single token on one field', () => {
    expect(registrationSearchWhere('Narek')).toEqual({
      OR: [
        { firstName: { contains: 'Narek', mode: 'insensitive' } },
        { lastName: { contains: 'Narek', mode: 'insensitive' } },
        { email: { contains: 'Narek', mode: 'insensitive' } },
        { emailNormalized: { contains: 'narek' } },
        { phone: { contains: 'Narek' } },
        { phoneNormalized: { contains: 'Narek' } },
        { ticketCode: { contains: 'Narek' } },
        { sourceRegistrationId: { contains: 'Narek' } },
      ],
    });
  });

  it('matches a spaced full name across first and last name', () => {
    const where = registrationSearchWhere('Narek Karapetyan');

    expect(where.OR).toContainEqual({
      AND: [
        {
          OR: [
            { firstName: { contains: 'Narek', mode: 'insensitive' } },
            { lastName: { contains: 'Narek', mode: 'insensitive' } },
          ],
        },
        {
          OR: [
            { firstName: { contains: 'Karapetyan', mode: 'insensitive' } },
            { lastName: { contains: 'Karapetyan', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });

  it('splits Armenian names and repeated spaces the same way', () => {
    const where = registrationSearchWhere('Վահան   Չոբանյան');
    const combined = where.OR?.find((clause) => 'AND' in clause && clause.AND);

    expect(combined).toEqual({
      AND: [
        {
          OR: [
            { firstName: { contains: 'Վահան', mode: 'insensitive' } },
            { lastName: { contains: 'Վահան', mode: 'insensitive' } },
          ],
        },
        {
          OR: [
            { firstName: { contains: 'Չոբանյան', mode: 'insensitive' } },
            { lastName: { contains: 'Չոբանյան', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });
});
