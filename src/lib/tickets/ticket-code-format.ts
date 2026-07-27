/** Scanner ticket alphabet: ASCII alphanumeric, case-sensitive. */
export const TICKET_CODE_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const TICKET_CODE_LENGTH = 13;

export const TICKET_CODE_PATTERN = /^[A-Za-z0-9]{13}$/;

/**
 * Validate an exact prefixless 13-character alphanumeric ticket code.
 * Does not trim or case-normalize. Safe for client and server.
 */
export function isValidTicketCode(value: string): boolean {
  return TICKET_CODE_PATTERN.test(value);
}
