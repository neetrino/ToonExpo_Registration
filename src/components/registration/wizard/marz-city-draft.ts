import { z } from 'zod';
import { OTHER_TEXT_MAX_LENGTH } from '@/lib/questionnaire/constants';
import { isMarzCityRegion, MARZ_CITY_REGIONS } from '@/lib/questionnaire/marz-cities';
import type { MarzCityRegion } from '@/lib/questionnaire/marz-cities';
import type { MarzRegion } from '@/lib/questionnaire/types';
import type { WizardState } from './types';

type WizardUpdater = <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;

export type MarzCityDraft = {
  aragatsotn: '' | 'ashtarak' | 'other';
  ararat: '' | 'artashat' | 'masis' | 'other';
  kotayk: '' | 'abovyan' | 'tsaghkadzor' | 'yeghvard' | 'other';
  tavush: '' | 'dilijan' | 'other';
};

export type MarzCityOtherDraft = Record<MarzCityRegion, string>;

const otherTextSchema = z.string().trim().min(1).max(OTHER_TEXT_MAX_LENGTH);

export const marzCityDraftSchema = z.object({
  aragatsotn: z.enum(['', 'ashtarak', 'other']),
  ararat: z.enum(['', 'artashat', 'masis', 'other']),
  kotayk: z.enum(['', 'abovyan', 'tsaghkadzor', 'yeghvard', 'other']),
  tavush: z.enum(['', 'dilijan', 'other']),
});

export const marzCityOtherDraftSchema = z.object({
  aragatsotn: z.string(),
  ararat: z.string(),
  kotayk: z.string(),
  tavush: z.string(),
});

export function emptyMarzCityDraft(): MarzCityDraft {
  return { aragatsotn: '', ararat: '', kotayk: '', tavush: '' };
}

export function emptyMarzCityOtherDraft(): MarzCityOtherDraft {
  return { aragatsotn: '', ararat: '', kotayk: '', tavush: '' };
}

/** Fills missing region keys and drops city codes that are no longer allowed. */
export function coerceMarzCityDraft(value: unknown): MarzCityDraft {
  const draft = emptyMarzCityDraft();
  if (!value || typeof value !== 'object') {
    return draft;
  }

  const record = value as Record<string, unknown>;
  for (const region of MARZ_CITY_REGIONS) {
    const selected = record[region];
    if (typeof selected === 'string') {
      writeMarzCity(draft, region, selected);
    }
  }

  return draft;
}

/** Keeps free-text only for known city regions. */
export function coerceMarzCityOtherDraft(value: unknown): MarzCityOtherDraft {
  const other = emptyMarzCityOtherDraft();
  if (!value || typeof value !== 'object') {
    return other;
  }

  const record = value as Record<string, unknown>;
  for (const region of MARZ_CITY_REGIONS) {
    const text = record[region];
    if (typeof text === 'string') {
      other[region] = text;
    }
  }

  return other;
}

/** Maps the single residence city onto the shared draft so validation stays in one place. */
export function residenceCityDraft(
  region: string,
  city: string,
  otherText: string,
): { regions: string[]; city: MarzCityDraft; other: MarzCityOtherDraft } | null {
  if (!isMarzCityRegion(region)) {
    return null;
  }

  const draft = emptyMarzCityDraft();
  const other = emptyMarzCityOtherDraft();
  if (city !== '' && !writeMarzCity(draft, region, city)) {
    return null;
  }

  other[region] = otherText;
  return { regions: [region], city: draft, other };
}

export function withMarzCitySelection(
  city: MarzCityDraft,
  other: MarzCityOtherDraft,
  region: MarzCityRegion,
  value: string,
): { city: MarzCityDraft; other: MarzCityOtherDraft } | null {
  const nextCity = { ...city };
  if (!writeMarzCity(nextCity, region, value)) {
    return null;
  }

  const nextOther = value === 'other' ? other : { ...other, [region]: '' };
  return { city: nextCity, other: nextOther };
}

function writeMarzCity(draft: MarzCityDraft, region: MarzCityRegion, value: string): boolean {
  switch (region) {
    case 'aragatsotn':
      if (value === 'ashtarak' || value === 'other') {
        draft.aragatsotn = value;
        return true;
      }
      return false;
    case 'ararat':
      if (value === 'artashat' || value === 'masis' || value === 'other') {
        draft.ararat = value;
        return true;
      }
      return false;
    case 'kotayk':
      if (
        value === 'abovyan' ||
        value === 'tsaghkadzor' ||
        value === 'yeghvard' ||
        value === 'other'
      ) {
        draft.kotayk = value;
        return true;
      }
      return false;
    case 'tavush':
      if (value === 'dilijan' || value === 'other') {
        draft.tavush = value;
        return true;
      }
      return false;
    default: {
      const exhaustive: never = region;
      return exhaustive;
    }
  }
}

export function pruneUnselectedMarzCities(
  regions: readonly MarzRegion[],
  city: MarzCityDraft,
  other: MarzCityOtherDraft,
): { city: MarzCityDraft; other: MarzCityOtherDraft } {
  const nextCity = { ...city };
  const nextOther = { ...other };

  for (const region of MARZ_CITY_REGIONS) {
    if (!regions.includes(region)) {
      nextCity[region] = '';
      nextOther[region] = '';
    }
  }

  return { city: nextCity, other: nextOther };
}

export function commitMarzRegions(
  onUpdate: WizardUpdater,
  state: Pick<WizardState, 'marzCity' | 'marzCityOther'>,
  values: MarzRegion[],
): void {
  const pruned = pruneUnselectedMarzCities(values, state.marzCity, state.marzCityOther);
  onUpdate('marzRegions', values);
  onUpdate('marzCity', pruned.city);
  onUpdate('marzCityOther', pruned.other);
}

export function commitMarzCity(
  onUpdate: WizardUpdater,
  state: Pick<WizardState, 'marzCity' | 'marzCityOther'>,
  region: MarzCityRegion,
  value: string,
): void {
  const next = withMarzCitySelection(state.marzCity, state.marzCityOther, region, value);
  if (!next) {
    return;
  }

  onUpdate('marzCity', next.city);
  onUpdate('marzCityOther', next.other);
}

export function addMarzCityDraftIssues(
  ctx: z.RefinementCtx,
  regions: readonly string[],
  city: MarzCityDraft,
  other: MarzCityOtherDraft,
  cityPath: (region: MarzCityRegion) => string,
  otherPath: (region: MarzCityRegion) => string,
): void {
  for (const region of MARZ_CITY_REGIONS) {
    if (!regions.includes(region)) {
      continue;
    }

    if (!city[region]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [cityPath(region)],
        message: 'required',
      });
      continue;
    }

    if (city[region] === 'other' && !otherTextSchema.safeParse(other[region]).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [otherPath(region)],
        message: 'required',
      });
    }
  }
}
