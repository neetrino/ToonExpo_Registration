import type { QuestionnaireLocale } from '@/lib/questionnaire/i18n';

type Localized = Record<QuestionnaireLocale, string>;

function example(hy: string, en: string, ru: string): Localized {
  return { hy, en, ru };
}

/** Example text for free-text answers. Radio and checkbox questions stay unlabeled. */
export const textFieldPlaceholders = {
  residenceCity: example('Մոսկվա', 'Moscow', 'Москва'),
  residenceRegion: example('Մոսկվայի մարզ', 'Moscow Oblast', 'Московская область'),
  residenceAbroad: example('Ռուսաստան', 'Russia', 'Россия'),
  aragatsotnLocalityOther: example('Ապարան', 'Aparan', 'Апаран'),
  country: example('Վրաստան', 'Georgia', 'Грузия'),
  investedCountry: example('ԱՄԷ', 'UAE', 'ОАЭ'),
  connectionOther: example('Բիզնես գործընկեր', 'Business partner', 'Бизнес-партнёр'),
  motiveOther: example('Ամառանոց', 'Holiday home', 'Дача'),
  propertyTypeOther: example('Ավտոկայանատեղի', 'Parking space', 'Паркинг'),
} as const;

export type TextFieldPlaceholderKey = keyof typeof textFieldPlaceholders;

/** Localized example shown inside an empty free-text field. */
export function getTextFieldPlaceholder(
  key: TextFieldPlaceholderKey,
  locale: QuestionnaireLocale,
): string {
  return textFieldPlaceholders[key][locale];
}
