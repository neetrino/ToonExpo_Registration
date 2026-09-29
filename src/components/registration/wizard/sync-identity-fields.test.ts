import { describe, expect, it } from 'vitest';
import { initialWizardState, type WizardState } from './types';
import { mergeIdentityFieldsFromDom } from './sync-identity-fields';

function mountIdentityFields(values: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: string;
}): HTMLDivElement {
  const root = document.createElement('div');

  const firstName = document.createElement('input');
  firstName.id = 'firstName';
  firstName.value = values.firstName;

  const lastName = document.createElement('input');
  lastName.id = 'lastName';
  lastName.value = values.lastName;

  const email = document.createElement('input');
  email.id = 'email';
  email.value = values.email;

  const phone = document.createElement('input');
  phone.id = 'phone';
  phone.name = 'phone';
  phone.value = values.phone;

  const phoneCountry = document.createElement('input');
  phoneCountry.type = 'hidden';
  phoneCountry.name = 'phoneCountry';
  phoneCountry.value = values.phoneCountry;

  root.append(firstName, lastName, email, phone, phoneCountry);
  return root;
}

function stateWithLaterStep(overrides: Partial<WizardState> = {}): WizardState {
  return {
    ...initialWizardState,
    visitPurpose: 'own_residence',
    ageBand: '35-44',
    privacyConsent: true,
    ...overrides,
  };
}

describe('mergeIdentityFieldsFromDom', () => {
  it('stores national digits from a painted Armenian number', () => {
    const state = stateWithLaterStep();
    const next = mergeIdentityFieldsFromDom(
      state,
      mountIdentityFields({
        firstName: 'Pavel',
        lastName: 'Badalyan',
        email: 'pavelbadalyan2002@gmail.com',
        phone: '+374 91 331 733',
        phoneCountry: 'AM',
      }),
    );

    expect(next.firstName).toBe('Pavel');
    expect(next.lastName).toBe('Badalyan');
    expect(next.email).toBe('pavelbadalyan2002@gmail.com');
    expect(next.phone).toBe('91331733');
    expect(next.phoneCountry).toBe('AM');
    expect(next.visitPurpose).toBe('own_residence');
    expect(next.ageBand).toBe('35-44');
    expect(next.privacyConsent).toBe(true);
  });

  it('stores ten national digits from a painted Russian mask', () => {
    const next = mergeIdentityFieldsFromDom(
      initialWizardState,
      mountIdentityFields({
        firstName: 'Pavel',
        lastName: 'Badalyan',
        email: 'pavelbadalyan2002@gmail.com',
        phone: '(965) 300-55-12',
        phoneCountry: 'RU',
      }),
    );

    expect(next.phone).toBe('9653005512');
    expect(next.phoneCountry).toBe('RU');
  });

  it('leaves state unchanged when the identity inputs are not mounted', () => {
    const state = stateWithLaterStep({ firstName: 'Kept' });

    expect(mergeIdentityFieldsFromDom(state, document.createElement('div'))).toBe(state);
  });
});
