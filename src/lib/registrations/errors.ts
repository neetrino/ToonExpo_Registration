export type RegistrationErrorCode =
  | 'VALIDATION_ERROR'
  | 'ORIGIN_REJECTED'
  | 'DUPLICATE_EMAIL'
  | 'NO_ACTIVE_EVENT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export type RegistrationAppError = {
  code: RegistrationErrorCode;
  httpStatus: 400 | 403 | 409 | 500 | 503;
};

const UNIQUE_TARGET_HINT = 'emailNormalized';

/**
 * Map Prisma / unknown errors to safe public registration error codes.
 */
export function mapRegistrationError(error: unknown): RegistrationAppError {
  if (isPrismaKnownError(error)) {
    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target ?? '');
      if (target.includes(UNIQUE_TARGET_HINT) || target.includes('eventId')) {
        return { code: 'DUPLICATE_EMAIL', httpStatus: 409 };
      }
      return { code: 'DUPLICATE_EMAIL', httpStatus: 409 };
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

function isPrismaKnownError(error: unknown): error is PrismaKnownErrorShape {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}
