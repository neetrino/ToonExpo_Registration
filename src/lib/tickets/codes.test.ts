import { describe, expect, it } from 'vitest';
import { generateTicketCode, generateTicketViewToken } from '@/lib/tickets/codes';
import {
  TICKET_CODE_LENGTH,
  TICKET_CODE_PATTERN,
  TOON_EXPO_TICKET_PREFIX,
  isValidTicketCode,
} from '@/lib/tickets/ticket-code-format';

describe('ticket codes', () => {
  it('generates a TE-prefixed 13-character uppercase ticket code', () => {
    const code = generateTicketCode();
    expect(code).toHaveLength(TICKET_CODE_LENGTH);
    expect(code.startsWith(TOON_EXPO_TICKET_PREFIX)).toBe(true);
    expect(TICKET_CODE_PATTERN.test(code)).toBe(true);
    expect(isValidTicketCode(code)).toBe(true);
  });

  it('rejects invalid ticket codes without normalizing', () => {
    expect(isValidTicketCode('TEABCDEFGHIJK')).toBe(true);
    expect(isValidTicketCode('MQ8D6N4T7C2X9')).toBe(true);
    expect(isValidTicketCode('abcdefghijklm')).toBe(false);
    expect(isValidTicketCode('ABCDEFGHIJKLM')).toBe(false);
    expect(isValidTicketCode('TEabcdefghijk')).toBe(false);
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
