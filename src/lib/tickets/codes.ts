import { randomBytes, randomInt } from 'node:crypto';
import { TICKET_CODE_ALPHABET, TICKET_CODE_LENGTH } from '@/lib/tickets/ticket-code-format';

export {
  TICKET_CODE_ALPHABET,
  TICKET_CODE_LENGTH,
  TICKET_CODE_PATTERN,
  isValidTicketCode,
} from '@/lib/tickets/ticket-code-format';

/** Hosted-ticket bearer token length in bytes before base64url encoding. */
export const TICKET_VIEW_TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure 13-character alphanumeric ticket code.
 * Does not use Math.random. Server-only.
 */
export function generateTicketCode(): string {
  let code = '';
  for (let i = 0; i < TICKET_CODE_LENGTH; i += 1) {
    code += TICKET_CODE_ALPHABET[randomInt(TICKET_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Generate a long unguessable bearer token for hosted ticket links.
 * Server-only.
 */
export function generateTicketViewToken(): string {
  return randomBytes(TICKET_VIEW_TOKEN_BYTES).toString('base64url');
}
