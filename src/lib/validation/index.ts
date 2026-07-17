export { PRIVACY_POLICY_VERSION } from '@/lib/validation/constants';
export {
  registrationBodySchema,
  type RegistrationBody,
  type RegistrationBodyInput,
} from '@/lib/validation/registration-schema';
export { normalizeEmail, normalizeName, trimEmail } from '@/lib/validation/normalize';
export { normalizePhone, type NormalizedPhone } from '@/lib/validation/phone';
