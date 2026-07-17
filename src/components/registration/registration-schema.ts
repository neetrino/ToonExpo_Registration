import { z } from 'zod';

export const registrationFormSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(20),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: 'consentRequired' }),
  }),
  website: z.string().max(0),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const registrationFormFieldKeys = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'privacyConsent',
] as const;

export type RegistrationFormFieldKey = (typeof registrationFormFieldKeys)[number];
