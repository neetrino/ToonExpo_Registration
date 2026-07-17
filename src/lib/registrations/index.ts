export { createRegistration, type CreateRegistrationResult } from '@/lib/registrations/create-registration';
export {
  mapRegistrationError,
  type RegistrationAppError,
  type RegistrationErrorCode,
} from '@/lib/registrations/errors';
export {
  sendConfirmationEmail,
  type ConfirmationEmailInput,
  type ConfirmationEmailResult,
} from '@/lib/registrations/send-confirmation-email';
