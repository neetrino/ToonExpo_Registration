import { nationalPhoneInput } from '@/lib/validation/phone';
import { resolvePhoneCountry } from '@/lib/validation/phone-countries';
import type { IdentityStepFields } from './step-identity-profile';

type IdentityFieldSnapshot = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: string;
};

function readInputValue(root: ParentNode, selector: string): string | null {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLInputElement)) {
    return null;
  }

  return element.value;
}

function readIdentityFieldSnapshot(root: ParentNode): IdentityFieldSnapshot | null {
  const firstName = readInputValue(root, '#firstName');
  const lastName = readInputValue(root, '#lastName');
  const email = readInputValue(root, '#email');
  const phone = readInputValue(root, 'input#phone') ?? readInputValue(root, 'input[name="phone"]');
  const phoneCountry = readInputValue(root, 'input[name="phoneCountry"]');

  if (
    firstName === null ||
    lastName === null ||
    email === null ||
    phone === null ||
    phoneCountry === null
  ) {
    return null;
  }

  return { firstName, lastName, email, phone, phoneCountry };
}

/**
 * Copies the mounted "who are you" inputs into wizard state.
 * Autofill can paint those fields without React `onChange`, so `.value` is the source of truth
 * at the moment "Next" is pressed. Phone is stored as national digits. When the step is not
 * mounted, `state` is returned unchanged.
 */
export function mergeIdentityFieldsFromDom<T extends IdentityStepFields>(
  state: T,
  root: ParentNode,
): T {
  const fields = readIdentityFieldSnapshot(root);
  if (!fields) {
    return state;
  }

  const phoneCountry = resolvePhoneCountry(fields.phoneCountry);
  return {
    ...state,
    firstName: fields.firstName,
    lastName: fields.lastName,
    email: fields.email,
    phone: nationalPhoneInput(fields.phone, phoneCountry),
    phoneCountry,
  };
}
