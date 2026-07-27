import { describe, expect, it } from 'vitest';
import {
  TICKET_CODE_LENGTH,
  TICKET_CODE_PATTERN,
  generateTicketCode,
  generateTicketViewToken,
  isValidTicketCode,
} from '@/lib/tickets/codes';

describe('ticket codes', () => {
  it('generates a 13-character alphanumeric code', () => {
    const code = generateTicketCode();
    expect(code).toHaveLength(TICKET_CODE_LENGTH);
    expect(TICKET_CODE_PATTERN.test(code)).toBe(true);
    expect(isValidTicketCode(code)).toBe(true);
  });

  it('rejects invalid ticket codes without normalizing', () => {
    expect(isValidTicketCode('abcdefghijklm')).toBe(true);
    expect(isValidTicketCode('ABCDEFGHIJKLM')).toBe(true);
    expect(isValidTicketCode('short')).toBe(false);
    expect(isValidTicketCode('TE-ABCDEFGHIJK')).toBe(false);
    expect(isValidTicketCode('abcdefghijkl!')).toBe(false);
    expect(isValidTicketCode(' abcdefghijklm')).toBe(false);
  });

  it('generates a long ticket view token', () => {
    const token = generateTicketViewToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(token).not.toMatch(/[+/=]/);
  });
});
