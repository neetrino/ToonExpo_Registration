import { secureSecretEqual } from '@/lib/security/secure-compare';

export type MootqAuthScope = 'write' | 'read';

export type MootqAuthResult =
  { ok: true } | { ok: false; status: 401 | 503; code: 'UNAUTHORIZED' | 'NOT_CONFIGURED' };

/**
 * Authenticate a Mootq bearer token for write or read scope.
 * Keys are read from env at call time so local boot does not require them.
 */
export function authenticateMootqRequest(request: Request, scope: MootqAuthScope): MootqAuthResult {
  const configured =
    scope === 'write' ? process.env.MOOTQ_WRITE_KEY?.trim() : process.env.MOOTQ_READ_KEY?.trim();

  if (!configured || configured.length < 32) {
    return { ok: false, status: 503, code: 'NOT_CONFIGURED' };
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, code: 'UNAUTHORIZED' };
  }

  const presented = header.slice('Bearer '.length).trim();
  if (!presented || !secureSecretEqual(presented, configured)) {
    return { ok: false, status: 401, code: 'UNAUTHORIZED' };
  }

  return { ok: true };
}
