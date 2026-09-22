import { randomBytes, randomInt } from 'node:crypto';
import {
  TICKET_CODE_ALPHABET,
  TICKET_CODE_BODY_LENGTH,
  TOON_EXPO_TICKET_PREFIX,
} from '@/lib/tickets/ticket-code-format';

/**
 * 128-bit hosted-ticket bearer, before base64url encoding.
 * Encodes to 22 characters, above the hosted-page minimum of 20.
 * Previously issued 32-byte tokens stay valid; only new links use this length.
 */
export const TICKET_VIEW_TOKEN_BYTES = 16;

/**
 * Generate a cryptographically secure Toon Expo ticket code: `TE` + 11 uppercase alphanumerics.
 * Uses `crypto.randomInt`; server-only.
 */
export function generateTicketCode(): string {
  let body = '';
  for (let i = 0; i < TICKET_CODE_BODY_LENGTH; i += 1) {
    body += TICKET_CODE_ALPHABET[randomInt(TICKET_CODE_ALPHABET.length)];
  }
  return `${TOON_EXPO_TICKET_PREFIX}${body}`;
}

/**
 * Generate an unguessable bearer token for hosted ticket links.
 * Server-only. 128 bits keeps the SMS link inside one UCS-2 segment.
 */
export function generateTicketViewToken(): string {
  return randomBytes(TICKET_VIEW_TOKEN_BYTES).toString('base64url');
}
