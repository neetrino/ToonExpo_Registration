export type RegistrationErrorCode =
  | 'VALIDATION_ERROR'
  | 'ORIGIN_REJECTED'
  | 'IDEMPOTENT_REPLAY'
  | 'TICKET_CODE_COLLISION'
  | 'NO_ACTIVE_EVENT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export type RegistrationAppError = {
  code: RegistrationErrorCode;
  httpStatus: 400 | 403 | 409 | 500 | 503;
};

/**
 * Map Prisma / unknown errors to safe public registration error codes.
 */
export function mapRegistrationError(error: unknown): RegistrationAppError {
  if (isPrismaKnownError(error)) {
    if (error.code === 'P2002') {
      const target = normalizeTarget(error.meta?.target);

      if (target.includes('idempotencyKey')) {
        return { code: 'IDEMPOTENT_REPLAY', httpStatus: 409 };
      }

      if (target.includes('ticketCode')) {
        return { code: 'TICKET_CODE_COLLISION', httpStatus: 503 };
      }

      return { code: 'INTERNAL_ERROR', httpStatus: 500 };
    }

    if (error.code === 'P1001' || error.code === 'P1017') {
      return { code: 'SERVICE_UNAVAILABLE', httpStatus: 503 };
    }
  }

  return { code: 'INTERNAL_ERROR', httpStatus: 500 };
}

type PrismaKnownErrorShape = {
  code: string;
  meta?: { target?: string | string[] };
};

function normalizeTarget(target: string | string[] | undefined): string {
  if (Array.isArray(target)) {
    return target.join(',');
  }

  return String(target ?? '');
}

function isPrismaKnownError(error: unknown): error is PrismaKnownErrorShape {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}
