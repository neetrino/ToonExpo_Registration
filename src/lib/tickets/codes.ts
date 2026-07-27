import { randomBytes, randomInt } from 'node:crypto';
import {
  TICKET_CODE_ALPHABET,
  TICKET_CODE_BODY_LENGTH,
  TOON_EXPO_TICKET_PREFIX,
} from '@/lib/tickets/ticket-code-format';

export {
  TICKET_CODE_ALPHABET,
  TICKET_CODE_BODY_LENGTH,
  TICKET_CODE_LENGTH,
  TICKET_CODE_PATTERN,
  MOOTQ_TICKET_PREFIX,
  TOON_EXPO_TICKET_PREFIX,
  isValidTicketCode,
} from '@/lib/tickets/ticket-code-format';

/** Hosted-ticket bearer token length in bytes before base64url encoding. */
export const TICKET_VIEW_TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure Toon Expo ticket code: `TE` + 11 uppercase alphanumerics.
 * Does not use Math.random. Server-only.
 */
export function generateTicketCode(): string {
  let body = '';
  for (let i = 0; i < TICKET_CODE_BODY_LENGTH; i += 1) {
    body += TICKET_CODE_ALPHABET[randomInt(TICKET_CODE_ALPHABET.length)];
  }
  return `${TOON_EXPO_TICKET_PREFIX}${body}`;
}

/**
 * Generate a long unguessable bearer token for hosted ticket links.
 * Server-only.
 */
export function generateTicketViewToken(): string {
  return randomBytes(TICKET_VIEW_TOKEN_BYTES).toString('base64url');
}
