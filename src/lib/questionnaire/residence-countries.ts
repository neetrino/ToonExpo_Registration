import { getCountries } from 'libphonenumber-js';

const COUNTRY_CODES = [
  ...new Set<string>([...getCountries(), 'AQ', 'BV', 'GS', 'HM', 'PN', 'TF', 'UM']),
];
const locales = ['hy', 'en', 'ru'] as const;
const russiaNames: Record<string, string> = {
  hy: 'Ռուսաստանի Դաշնություն',
  en: 'Russian Federation',
  ru: 'Российская Федерация',
};
const names = locales.map((locale) => new Intl.DisplayNames([locale], { type: 'region' }));

export function listResidenceCountries(locale: string) {
  const display = new Intl.DisplayNames([locale], { type: 'region' });
  return COUNTRY_CODES.map((code) => ({
    code,
    name:
      code === 'RU' ? (russiaNames[locale] ?? 'Russian Federation') : (display.of(code) ?? code),
    search: [
      code,
      ...names.map((localizer) => localizer.of(code)),
      ...(code === 'RU' ? [...Object.values(russiaNames), 'РФ', 'ՌԴ'] : []),
    ].join(' '),
  })).sort((a, b) => a.name.localeCompare(b.name, locale));
}

const allowedNames = new Set(
  [
    ...Object.values(russiaNames),
    ...COUNTRY_CODES.flatMap((code) => [
      code,
      ...names.map((localizer) => localizer.of(code) ?? code),
    ]),
  ].map((name) => name.toLocaleLowerCase()),
);
export function isResidenceCountry(value: string): boolean {
  return allowedNames.has(value.trim().toLocaleLowerCase());
}

export function filterResidenceCountries(
  countries: ReturnType<typeof listResidenceCountries>,
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase();
  // Treat country abbreviations as exact aliases, not substrings of unrelated names.
  if (normalized === 'рф' || normalized === 'ռդ')
    return countries.filter((country) => country.code === 'RU');
  const exactCode = countries.find((country) => country.code.toLocaleLowerCase() === normalized);
  if (exactCode) return [exactCode];
  return countries.filter((country) => country.search.toLocaleLowerCase().includes(normalized));
}
