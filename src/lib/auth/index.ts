export { handlers, auth, signIn, signOut } from '@/lib/auth/auth';
export { authConfig } from '@/lib/auth/config';
export { getAdminSession, type AdminSession } from '@/lib/auth/guards';
export {
  requireAdminSession,
  AdminSessionError,
  type RequireAdminSessionOptions,
} from '@/lib/auth/require-admin';
export { isProtectedAdminPath } from '@/lib/auth/paths';
export {
  ARGON2_HASH_OPTIONS,
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyPassword,
  verifyDummyPassword,
} from '@/lib/auth/password';
export {
  isLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
  resetLoginThrottleForTests,
} from '@/lib/auth/login-throttle';
