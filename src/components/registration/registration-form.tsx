import type { Locale } from '@/types/locale';
import { RegistrationWizard } from './registration-wizard';

type RegistrationFormProps = {
  locale: Locale;
};

/** @deprecated Use RegistrationWizard directly. */
export function RegistrationForm({ locale }: RegistrationFormProps) {
  return <RegistrationWizard locale={locale} />;
}
