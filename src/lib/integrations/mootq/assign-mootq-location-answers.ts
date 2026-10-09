import type { MootqCodedAnswers } from '@/lib/integrations/mootq/apply-registration-schema';
import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import type { MootqCityQuestions } from '@/lib/integrations/mootq/mootq-question-codes';
import { MOOTQ_OTHER_OPTION } from '@/lib/integrations/mootq/registration-schema';
import type { LocationChoice } from '@/lib/questionnaire/types';

export type MootqLocationCodes = {
  scope: string;
  yerevan: string;
  marz: string;
  abroad: string;
  abroadOther: string;
  cities: Record<string, MootqCityQuestions>;
};

export function assignMootqLocationChoice(
  coded: MootqCodedAnswers,
  location: LocationChoice,
  codes: MootqLocationCodes,
): void {
  if (location.yerevanDistricts.length > 0) {
    coded[codes.scope] = toMootqOptionLabel('locationSeekScope', 'yerevan');
    coded[codes.yerevan] = location.yerevanDistricts.map((code) =>
      toMootqOptionLabel('yerevanDistrict', code),
    );
    return;
  }
  if (location.marzRegions.length > 0) {
    coded[codes.scope] = toMootqOptionLabel('locationSeekScope', 'marz');
    coded[codes.marz] = location.marzRegions.map((code) => toMootqOptionLabel('marzRegion', code));
    assignMarzCities(coded, location, codes.cities);
    return;
  }
  assignMootqCountryList(
    coded,
    location.abroadCountries,
    location.abroadCountriesOther,
    codes.abroad,
    codes.abroadOther,
  );
  if (location.abroadCountries.length > 0 || location.abroadCountriesOther?.trim()) {
    coded[codes.scope] = toMootqOptionLabel('locationSeekScope', 'abroad');
  }
}

export function assignMootqCountryList(
  coded: MootqCodedAnswers,
  countries: readonly string[],
  other: string | undefined,
  countriesCode: string,
  otherCode: string,
): void {
  if (countries.length > 0) {
    coded[countriesCode] = countries.map((code) => toMootqOptionLabel('abroadCountry', code));
  }
  if (other?.trim()) {
    coded[otherCode] = other.trim();
  }
}

function assignMarzCities(
  coded: MootqCodedAnswers,
  location: LocationChoice,
  questions: Record<string, MootqCityQuestions>,
): void {
  for (const region of location.marzRegions) {
    const question = questions[region];
    const entry = readCity(location.marzCities, region);
    if (!question || !entry?.city) {
      continue;
    }
    if (entry.city === 'other') {
      const text = entry.other?.trim();
      if (!text) {
        continue;
      }
      coded[question.cities] = [MOOTQ_OTHER_OPTION];
      coded[question.other] = text;
      continue;
    }
    coded[question.cities] = [toMootqOptionLabel('marzCity', entry.city)];
  }
}

function readCity(
  cities: LocationChoice['marzCities'],
  region: string,
): { city?: string; other?: string } | undefined {
  if (!cities) {
    return undefined;
  }
  const entry = (cities as Record<string, { city?: string; other?: string } | undefined>)[region];
  return entry && typeof entry === 'object' ? entry : undefined;
}
