/** Default page size for the admin registration table. */
export const ADMIN_PAGE_SIZE = 20;

/** Operator-facing timezone for admin UI and CSV export (Armenia, UTC+4, no DST). */
export const ADMIN_DISPLAY_TIMEZONE = 'Asia/Yerevan';

/** Maximum search query length accepted by admin list/export filters. */
export const ADMIN_SEARCH_MAX_LENGTH = 100;

/** Delay before live admin search updates the URL. */
export const ADMIN_SEARCH_DEBOUNCE_MS = 300;

/** Minimum wait between admin QR resends for the same registration. */
export const ADMIN_TICKET_RESEND_COOLDOWN_MS = 60_000;

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
  { key: 'registeredAt', header: 'Registered at (Yerevan)' },
  { key: 'firstName', header: 'First name' },
  { key: 'lastName', header: 'Last name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'locale', header: 'Locale' },
  { key: 'sourceSystem', header: 'Source' },
  { key: 'sourceRegistrationId', header: 'Source registration ID' },
  { key: 'utmSource', header: 'UTM source' },
  { key: 'utmMedium', header: 'UTM medium' },
  { key: 'utmCampaign', header: 'UTM campaign' },
  { key: 'ticketCode', header: 'Ticket code' },
  { key: 'attendanceStatus', header: 'Attendance' },
  { key: 'emailDeliveryStatus', header: 'Email delivery' },
  { key: 'formVersion', header: 'Form version' },
  { key: 'formChannel', header: 'Form channel' },
] as const satisfies readonly CsvColumnDef[];

/**
 * Questionnaire answer columns for admin CSV export.
 * One column per question; unused branch fields stay empty.
 */
export const CSV_ANSWER_COLUMNS = [
  { key: 'visitPurpose', header: 'Visit purpose' },
  { key: 'ageBand', header: 'Age' },
  { key: 'residence', header: 'Place of residence' },
  { key: 'residenceDetail', header: 'Place of residence (detail)' },
  { key: 'interestType', header: 'Interest type' },
  { key: 'abroadCountries', header: 'Property abroad — country' },
  { key: 'abroadCountriesOther', header: 'Abroad countries (other)' },
  { key: 'locationSeek', header: 'Location' },
  { key: 'locationSeekOther', header: 'Location abroad (country)' },
  { key: 'locationSeekAbroadCountries', header: 'Location abroad (countries)' },
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
  { key: 'priorInvestmentExperienceOther', header: 'Prior investment abroad (country)' },
  { key: 'marketInterests', header: 'Market interests' },
  { key: 'researchGoal', header: 'Research goal' },
  { key: 'interestedWhere', header: 'Interested where' },
  { key: 'interestedWhereOther', header: 'Interested where (other)' },
  { key: 'purchaseHorizon', header: 'Purchase horizon' },
  { key: 'newsletter', header: 'Newsletter' },
  { key: 'residenceCity', header: 'RF city' },
  { key: 'residenceRegionRf', header: 'RF region' },
  { key: 'armeniaConnection', header: 'Connection to Armenia' },
  { key: 'armeniaConnectionOther', header: 'Connection to Armenia (other)' },
  { key: 'purchaseMotives', header: 'Purchase motives' },
  { key: 'purchaseMotivesOther', header: 'Purchase motives (other)' },
  { key: 'spyurkInterestTypes', header: 'Spyurk interest types' },
  { key: 'spyurkInterestTypesOther', header: 'Spyurk interest types (other)' },
  { key: 'propertyCountry', header: 'Property country' },
  { key: 'propertyCountryOther', header: 'Property country (other)' },
  { key: 'purchaseBudgetUsd', header: 'Purchase budget (USD)' },
  { key: 'armeniaVisitTiming', header: 'Visit to Armenia' },
] as const satisfies readonly CsvColumnDef[];

export const CSV_EXPORT_COLUMNS = [
  ...CSV_IDENTITY_COLUMNS,
  ...CSV_ANSWER_COLUMNS,
] as const satisfies readonly CsvColumnDef[];

export type CsvExportColumnKey = (typeof CSV_EXPORT_COLUMNS)[number]['key'];
