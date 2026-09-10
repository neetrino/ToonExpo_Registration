import { FORM_VERSION } from '@/lib/questionnaire/constants';
import { SPYURK_FORM_VERSION } from '@/lib/questionnaire/spyurk/constants';

export const FORM_CHANNELS = ['GENERAL', 'SPYURK_RF'] as const;

export type FormChannel = (typeof FORM_CHANNELS)[number];

/**
 * Maps a public formVersion to the server-assigned Registration.formChannel.
 * Unknown / legacy versions are treated as the general Armenia landing.
 */
export function formChannelFromVersion(formVersion: string | null | undefined): FormChannel {
  return formVersion === SPYURK_FORM_VERSION ? 'SPYURK_RF' : 'GENERAL';
}

export function isSpyurkFormVersion(formVersion: string | null | undefined): boolean {
  return formVersion === SPYURK_FORM_VERSION;
}

export function isGeneralFormVersion(formVersion: string | null | undefined): boolean {
  return formVersion === FORM_VERSION;
}
