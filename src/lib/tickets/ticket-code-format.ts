/** Ticket code body alphabet: uppercase A–Z and digits 0–9. */
export const TICKET_CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const TICKET_CODE_BODY_LENGTH = 11;

export const TOON_EXPO_TICKET_PREFIX = 'TE';

export const MOOTQ_TICKET_PREFIX = 'MQ';

export const TICKET_CODE_LENGTH = 13;

export const TICKET_CODE_PATTERN = /^(TE|MQ)[A-Z0-9]{11}$/;

/**
 * Validate a 13-character TE/MQ ticket code (uppercase body, case-sensitive).
 * Does not trim or case-normalize. Safe for client and server.
 */
export function isValidTicketCode(value: string): boolean {
  return TICKET_CODE_PATTERN.test(value);
}
