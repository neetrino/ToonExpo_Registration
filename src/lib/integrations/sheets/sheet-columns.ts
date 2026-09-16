import type { CsvExportColumnKey } from '@/lib/admin/constants';

export type SheetColumnKey =
  | 'registrationId'
  | Exclude<
      CsvExportColumnKey,
      | 'sourceSystem'
      | 'sourceRegistrationId'
      | 'formVersion'
      | 'formChannel'
      | 'emailDeliveryStatus'
    >
  | 'emailDelivery';

export type SheetColumnDef = {
  key: SheetColumnKey;
  header: string;
};

/** Shared identity columns — short Armenian labels for operators. */
export const SHEET_IDENTITY_COLUMNS = [
  { key: 'registrationId', header: 'Գրանցման ID' },
  { key: 'registeredAt', header: 'Ամսաթիվ' },
  { key: 'firstName', header: 'Անուն' },
  { key: 'lastName', header: 'Ազգանուն' },
  { key: 'email', header: 'Էլ. փոստ' },
  { key: 'phone', header: 'Հեռախոս' },
  { key: 'locale', header: 'Լեզու' },
  { key: 'ticketCode', header: 'Տոմսի կոդ' },
  { key: 'attendanceStatus', header: 'Այցելություն' },
  { key: 'emailDelivery', header: 'Email կարգավիճակ' },
  { key: 'utmSource', header: 'UTM source' },
  { key: 'utmMedium', header: 'UTM medium' },
  { key: 'utmCampaign', header: 'UTM campaign' },
] as const satisfies readonly SheetColumnDef[];

/** General form answer columns only (no Spyurk-only fields). */
export const SHEET_GENERAL_ANSWER_COLUMNS = [
  { key: 'ageBand', header: 'Տարիք' },
  { key: 'residence', header: 'Բնակության վայր' },
  { key: 'residenceDetail', header: 'Բնակության մանրամասն' },
  { key: 'visitPurpose', header: 'Այցի նպատակ' },
  { key: 'interestType', header: 'Հետաքրքրող գույք' },
  { key: 'abroadCountries', header: 'Արտերկիր — երկիր' },
  { key: 'abroadCountriesOther', header: 'Արտերկիր (այլ)' },
  { key: 'locationSeek', header: 'Որտեղ է փնտրում' },
  { key: 'yerevanDistricts', header: 'Երևան — շրջան' },
  { key: 'marzRegions', header: 'Մարզ' },
  { key: 'locationSeekOther', header: 'Որտեղ (այլ երկիր)' },
  { key: 'locationSeekAbroadCountries', header: 'Որտեղ — արտերկիր' },
  { key: 'areaSqm', header: 'Մակերես (քմ)' },
  { key: 'purchaseMethod', header: 'Ձեռքբերման եղանակ' },
  { key: 'monthlyBudget', header: 'Ամսական բյուջե' },
  { key: 'decisionStage', header: 'Որոշման փուլ' },
  { key: 'investmentPropertyType', header: 'Ներդրումային գույքի տեսակ' },
  { key: 'investmentPropertyTypeOther', header: 'Ներդրումային գույք (այլ)' },
  { key: 'investmentMarket', header: 'Ներդրումային շուկա' },
  { key: 'investmentMarketOther', header: 'Ներդրումային շուկա (այլ)' },
  { key: 'investmentGoal', header: 'Ներդրումային նպատակ' },
  { key: 'investmentTimeline', header: 'Ներդրումային ժամկետ' },
  { key: 'investmentBudgetUsd', header: 'Ներդրումային բյուջե (USD)' },
  { key: 'priorInvestmentExperience', header: 'Նախորդ ներդրումային փորձ' },
  { key: 'priorInvestmentExperienceOther', header: 'Նախորդ փորձ (այլ)' },
  { key: 'marketInterests', header: 'Շուկայական հետաքրքրություններ' },
  { key: 'researchGoal', header: 'Հետազոտության նպատակ' },
  { key: 'interestedWhere', header: 'Հետաքրքրող վայր' },
  { key: 'interestedWhereOther', header: 'Հետաքրքրող վայր (այլ)' },
  { key: 'purchaseHorizon', header: 'Գնման հորիզոն' },
  { key: 'newsletter', header: 'Տեղեկագիր' },
] as const satisfies readonly SheetColumnDef[];

/** Spyurk RF answer columns only. */
export const SHEET_SPYURK_ANSWER_COLUMNS = [
  { key: 'ageBand', header: 'Տարիք' },
  { key: 'residenceCity', header: 'Քաղաք (ՌԴ)' },
  { key: 'residenceRegionRf', header: 'Մարզ / շրջան (ՌԴ)' },
  { key: 'armeniaConnection', header: 'Կապ Հայաստանի հետ' },
  { key: 'armeniaConnectionOther', header: 'Կապ Հայաստանի հետ (այլ)' },
  { key: 'visitPurpose', header: 'Այցի նպատակ' },
  { key: 'purchaseMotives', header: 'Գնման նպատակներ' },
  { key: 'purchaseMotivesOther', header: 'Գնման նպատակներ (այլ)' },
  { key: 'spyurkInterestTypes', header: 'Հետաքրքրող գույք' },
  { key: 'spyurkInterestTypesOther', header: 'Հետաքրքրող գույք (այլ)' },
  { key: 'propertyCountry', header: 'Գույքի երկիր' },
  { key: 'propertyCountryOther', header: 'Գույքի երկիր (այլ)' },
  { key: 'purchaseBudgetUsd', header: 'Գնման բյուջե (USD)' },
  { key: 'areaSqm', header: 'Մակերես (քմ)' },
  { key: 'purchaseMethod', header: 'Ձեռքբերման եղանակ' },
  { key: 'armeniaVisitTiming', header: 'Այց Հայաստան' },
  { key: 'decisionStage', header: 'Որոշման փուլ' },
  { key: 'investmentPropertyType', header: 'Ներդրումային գույքի տեսակ' },
  { key: 'investmentPropertyTypeOther', header: 'Ներդրումային գույք (այլ)' },
  { key: 'investmentGoal', header: 'Ներդրումային նպատակ' },
  { key: 'investmentTimeline', header: 'Ներդրումային ժամկետ' },
  { key: 'investmentBudgetUsd', header: 'Ներդրումային բյուջե (USD)' },
  { key: 'priorInvestmentExperience', header: 'Նախորդ ներդրումային փորձ' },
  { key: 'priorInvestmentExperienceOther', header: 'Նախորդ փորձ (այլ)' },
  { key: 'marketInterests', header: 'Շուկայական հետաքրքրություններ' },
  { key: 'researchGoal', header: 'Հետազոտության նպատակ' },
  { key: 'purchaseHorizon', header: 'Գնման հորիզոն' },
  { key: 'newsletter', header: 'Տեղեկագիր' },
] as const satisfies readonly SheetColumnDef[];

export const SHEET_GENERAL_COLUMNS = [
  ...SHEET_IDENTITY_COLUMNS,
  ...SHEET_GENERAL_ANSWER_COLUMNS,
] as const satisfies readonly SheetColumnDef[];

export const SHEET_SPYURK_COLUMNS = [
  ...SHEET_IDENTITY_COLUMNS,
  ...SHEET_SPYURK_ANSWER_COLUMNS,
] as const satisfies readonly SheetColumnDef[];

export function sheetLocaleLabel(locale: string): string {
  switch (locale) {
    case 'hy':
      return 'Հայերեն';
    case 'ru':
      return 'Русский';
    case 'en':
      return 'English';
    default:
      return locale;
  }
}

export function sheetAttendanceLabel(status: string | null): string {
  switch (status) {
    case 'VISITED':
      return 'Այցելել է';
    case 'NOT_VISITED':
      return 'Չի այցելել';
    default:
      return status ?? '';
  }
}

export function sheetEmailDeliveryLabel(status: string): string {
  switch (status) {
    case 'SENT':
      return 'Ուղարկված';
    case 'FAILED':
      return 'Ձախողված';
    case 'PENDING':
      return 'Սպասում է';
    default:
      return status;
  }
}

export function sheetNewsletterLabel(value: string): string {
  if (value === 'true' || value === 'Yes' || value === 'Այո') {
    return 'Այո';
  }
  if (value === 'false' || value === 'No' || value === 'Ոչ') {
    return 'Ոչ';
  }
  return value;
}
