/** Default page size for the admin registration table. */
export const ADMIN_PAGE_SIZE = 25;

/** Maximum search query length accepted by admin list/export filters. */
export const ADMIN_SEARCH_MAX_LENGTH = 100;

/** Cache-Control for admin responses that include participant data. */
export const ADMIN_NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
} as const;

export type CsvColumnDef = {
  key: string;
  header: string;
};

/** Identity / meta columns for admin CSV export (human-readable headers). */
export const CSV_IDENTITY_COLUMNS = [
  { key: 'registeredAt', header: 'Registered at' },
  { key: 'firstName', header: 'First name' },
  { key: 'lastName', header: 'Last name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'locale', header: 'Locale' },
  { key: 'emailDeliveryStatus', header: 'Email delivery' },
  { key: 'formVersion', header: 'Form version' },
] as const satisfies readonly CsvColumnDef[];

/**
 * Questionnaire answer columns for admin CSV export.
 * One column per question; unused branch fields stay empty.
 */
export const CSV_ANSWER_COLUMNS = [
  { key: 'visitPurpose', header: 'Visit purpose' },
  { key: 'ageBand', header: 'Age' },
  { key: 'interestType', header: 'Interest type' },
  { key: 'abroadCountries', header: 'Property abroad — country' },
  { key: 'abroadCountriesOther', header: 'Abroad countries (other)' },
  { key: 'locationSeek', header: 'Location' },
  { key: 'yerevanDistricts', header: 'Yerevan district' },
  { key: 'marzRegions', header: 'Region (marz)' },
  { key: 'areaSqm', header: 'Property size (sqm)' },
  { key: 'purchaseMethod', header: 'Purchase method' },
  { key: 'monthlyBudget', header: 'Monthly payment budget' },
  { key: 'decisionStage', header: 'Decision stage' },
  { key: 'investmentPropertyType', header: 'Investment property type' },
  { key: 'investmentPropertyTypeOther', header: 'Investment property type (other)' },
  { key: 'investmentMarket', header: 'Investment market' },
  { key: 'investmentMarketOther', header: 'Investment market (other)' },
  { key: 'investmentGoal', header: 'Investment goal' },
  { key: 'investmentTimeline', header: 'Investment timeline' },
  { key: 'investmentBudgetUsd', header: 'Investment budget (USD)' },
  { key: 'priorInvestmentExperience', header: 'Prior investment experience' },
  { key: 'marketInterests', header: 'Market interests' },
  { key: 'researchGoal', header: 'Research goal' },
  { key: 'interestedWhere', header: 'Interested where' },
  { key: 'interestedWhereOther', header: 'Interested where (other)' },
  { key: 'purchaseHorizon', header: 'Purchase horizon' },
  { key: 'newsletter', header: 'Newsletter' },
] as const satisfies readonly CsvColumnDef[];

export const CSV_EXPORT_COLUMNS = [
  ...CSV_IDENTITY_COLUMNS,
  ...CSV_ANSWER_COLUMNS,
] as const satisfies readonly CsvColumnDef[];

export type CsvExportColumnKey = (typeof CSV_EXPORT_COLUMNS)[number]['key'];
