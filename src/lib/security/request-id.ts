import { randomUUID } from 'node:crypto';

const REQUEST_ID_HEADER = 'x-request-id';
const MAX_INCOMING_REQUEST_ID_LENGTH = 128;
const SAFE_REQUEST_ID = /^[\w.:-]+$/;

/**
 * Create a new opaque request correlation id.
 */
export function createRequestId(): string {
  return randomUUID();
}

/**
 * Prefer a safe inbound `x-request-id`, otherwise generate one.
 */
export function getOrCreateRequestId(request: Request): string {
  const incoming = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (
    incoming &&
    incoming.length <= MAX_INCOMING_REQUEST_ID_LENGTH &&
    SAFE_REQUEST_ID.test(incoming)
  ) {
    return incoming;
  }

  return createRequestId();
}

/**
 * Response header pair for correlating client and server logs.
 */
export function requestIdHeaders(requestId: string): { 'x-request-id': string } {
  return { [REQUEST_ID_HEADER]: requestId };
}
