import QRCode from 'qrcode';

/** Scanner-friendly defaults; tune after hardware fixture tests. */
export const TICKET_QR_WIDTH = 320;
export const TICKET_QR_MARGIN = 2;
export const TICKET_QR_ERROR_CORRECTION = 'M' as const;

/**
 * Render a PNG buffer whose QR payload is exactly the stored ticket code.
 */
export async function renderTicketQrPng(ticketCode: string): Promise<Buffer> {
  return QRCode.toBuffer(ticketCode, {
    type: 'png',
    width: TICKET_QR_WIDTH,
    margin: TICKET_QR_MARGIN,
    errorCorrectionLevel: TICKET_QR_ERROR_CORRECTION,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}
