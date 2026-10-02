/**
 * Ticket QR SMS is paused until the pre-expo send.
 * Email QR delivery stays on. Set this to true to resume SMS job creation and dispatch.
 */
export const TICKET_SMS_DELIVERY_ENABLED = false;

/** Whether ticket QR messages may be queued or sent by SMS. */
export function isTicketSmsDeliveryEnabled(): boolean {
  return TICKET_SMS_DELIVERY_ENABLED;
}
