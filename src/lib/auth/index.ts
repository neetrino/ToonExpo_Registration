export { handlers, auth, signIn, signOut } from '@/lib/auth/auth';
export { authConfig } from '@/lib/auth/config';
export { getAdminSession } from '@/lib/auth/guards';
export { isProtectedAdminPath } from '@/lib/auth/paths';
export { hashPassword, verifyPassword } from '@/lib/auth/password';
export {
  isLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
  resetLoginThrottleForTests,
} from '@/lib/auth/login-throttle';
