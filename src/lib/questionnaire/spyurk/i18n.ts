import {
  getQuestionnaireLabel,
  questionnaireI18n,
  type QuestionnaireLocale,
} from '@/lib/questionnaire/i18n';

type Localized = Record<QuestionnaireLocale, string>;

function L(hy: string, en: string, ru: string): Localized {
  return { hy, en, ru };
}

const spyurkQuestions = {
  residenceCity: L(
    'Բնակության քաղաքը ՌԴ-ում',
    'City of residence in the Russian Federation',
    'Город проживания в Российской Федерации',
  ),
  residenceRegion: L(
    'Բնակության մարզը / շրջանը ՌԴ-ում',
    'Region of residence in the Russian Federation',
    'Область / регион проживания в Российской Федерации',
  ),
  armeniaConnection: L(
    'Կա՞ արդյոք կապ Հայաստանի հետ',
    'Do you have a connection to Armenia?',
    'Есть ли у Вас связь с Арменией?',
  ),
  armeniaConnectionOther: L('Այլ (նշեք)', 'Other (please specify)', 'Другое (укажите)'),
  purchaseMotives: L(
    'Ի՞նչ նպատակով եք դիտարկում անշարժ գույքի ձեռքբերումը',
    'Why are you considering purchasing real estate?',
    'Для чего Вы рассматриваете приобретение недвижимости?',
  ),
  purchaseMotivesOther: L('Այլ (նշեք)', 'Other (please specify)', 'Другое (укажите)'),
  interestTypes: L(
    'Ի՞նչ անշարժ գույք է Ձեզ հետաքրքրում',
    'What type of property are you interested in?',
    'Какая недвижимость Вас интересует?',
  ),
  interestTypesOther: L(
    'Այլ (խնդրում ենք նշել)',
    'Other (please specify)',
    'Другое (пожалуйста, укажите)',
  ),
  propertyCountry: L(
    'Ո՞ր երկրում եք դիտարկում անշարժ գույքը',
    'In which country are you considering property?',
    'В какой стране Вы рассматриваете недвижимость?',
  ),
  propertyCountryOther: L('Նշեք երկիրը', 'Please specify the country', 'Укажите страну'),
  purchaseBudgetUsd: L(
    'Ի՞նչ բյուջե եք դիտարկում անշարժ գույք ձեռք բերելու համար',
    'What property purchase budget are you considering?',
    'Какой бюджет на приобретение недвижимости Вы рассматриваете?',
  ),
  armeniaVisitTiming: L(
    'Ե՞րբ եք նախատեսում գալ Հայաստան',
    'When do you plan to come to Armenia?',
    'Когда Вы планируете приехать в Армению?',
  ),
  investmentPropertyTypes: L(
    'Ո՞ր տեսակի ներդրումային գույքն է Ձեզ առավել հետաքրքրում',
    'What type of investment property interests you most?',
    'Какой тип инвестиционной недвижимости Вас интересует больше всего?',
  ),
} as const;

const questionFallback = {
  ageBand: 'ageBand',
  visitPurpose: 'visitPurpose',
  areaSqm: 'areaSqm',
  purchaseMethod: 'purchaseMethod',
  decisionStage: 'decisionStage',
  newsletter: 'newsletter',
  investmentPropertyTypeOther: 'investmentPropertyTypeOther',
  investmentGoal: 'investmentGoal',
  investmentTimeline: 'investmentTimeline',
  investmentBudgetUsd: 'investmentBudgetUsd',
  priorInvestmentExperience: 'priorInvestmentExperience',
  priorInvestmentExperienceOther: 'priorInvestmentExperienceOther',
  marketInterests: 'marketInterests',
  researchGoal: 'researchGoal',
  purchaseHorizon: 'purchaseHorizon',
} as const satisfies Record<string, keyof typeof questionnaireI18n.questions>;

export type SpyurkQuestionKey = keyof typeof spyurkQuestions | keyof typeof questionFallback;

const spyurkOptions = {
  armeniaConnection: {
    born_in_armenia: L('Ծնվել եմ Հայաստանում', 'I was born in Armenia', 'Родился(ась) в Армении'),
    ra_citizenship: L(
      'Ունեմ ՀՀ քաղաքացիություն',
      'I have citizenship of the Republic of Armenia',
      'Имею гражданство Республики Армения',
    ),
    family_from_armenia: L(
      'Ծնողներս / ազգականներս Հայաստանից են',
      'My parents / relatives are from Armenia',
      'Родители / родственники из Армении',
    ),
    previously_lived: L(
      'Ավելի վաղ ապրել եմ Հայաստանում',
      'I previously lived in Armenia',
      'Ранее проживал(а) в Армении',
    ),
    regular_visits: L(
      'Կանոնավոր այցելում եմ Հայաստան',
      'I visit Armenia regularly',
      'Регулярно посещаю Армению',
    ),
    other: L('Այլ', 'Other', 'Другое'),
  },
  purchaseMotive: {
    permanent_relocation: L(
      'Մշտական բնակություն / տեղափոխություն Հայաստան',
      'Permanent residence / moving to Armenia',
      'Постоянное проживание / переезд в Армению',
    ),
    own_stays: L(
      'Սեփական բնակություն Հայաստան այցելությունների ժամանակ',
      'My own stays when visiting Armenia',
      'Для собственного проживания во время поездок в Армению',
    ),
    family_housing: L(
      'Ընտանիքի կամ ազգականների բնակություն',
      'Housing for family or relatives',
      'Проживание семьи или родственников',
    ),
    children_education: L(
      'Երեխաների կրթություն / ընտանիքի ապագա տեղափոխություն',
      "Children's education / a future family move",
      'Образование детей / будущий переезд семьи',
    ),
    retirement_plan: L(
      'Ապագա բնակության վայր կամ կենսաթոշակային պլան',
      'A future home or retirement plan',
      'Будущее место жительства или пенсионный план',
    ),
    rental_when_away: L(
      'Վարձակալություն բացակայության ժամանակ',
      'Renting it out when I am away',
      'Сдача в аренду в период отсутствия',
    ),
    investment_income: L(
      'Ներդրումներ և եկամուտ',
      'Investment and income',
      'Инвестиции и получение дохода',
    ),
    capital_preservation_growth: L(
      'Կապիտալի պահպանում և աճ',
      'Preserving and growing capital',
      'Сохранение и приумножение капитала',
    ),
    other: L('Այլ', 'Other', 'Другое'),
  },
  interestType: {
    apartment_new: L('Նորակառույց բնակարան', 'New-build apartment', 'Квартира в новостройке'),
    apartments: L('Ապարտամենտներ', 'Apartments', 'Апартаменты'),
    house_villa_townhouse: L(
      'Առանձնատուն / վիլլա / թաունհաուս',
      'Private house / villa / townhouse',
      'Частный дом / вилла / таунхаус',
    ),
    land_for_house: L(
      'Հողատարածք տուն կառուցելու համար',
      'Land for building a house',
      'Земельный участок для строительства дома',
    ),
    other: L('Այլ', 'Other', 'Другое'),
  },
  propertyCountry: {
    armenia: L('Հայաստան', 'Armenia', 'Армения'),
    other: L('Այլ երկրներ', 'Other countries', 'Другие страны'),
  },
  purchaseMethod: {
    cash: L('Սեփական միջոցներով', 'Own funds', 'За собственные средства'),
    mortgage: L('Հիփոթեքային վարկ', 'Mortgage', 'Ипотечный кредит'),
    installment: L(
      'Տարաժամկետ վճարում (կառուցապատողի ապառիկ)',
      'Installment from the developer',
      'Рассрочка (рассрочка от застройщика)',
    ),
    mixed: L(
      'Սեփական միջոցներ + հիփոթեքային վարկ',
      'Own funds + mortgage (combined)',
      'Собственные средства + ипотечный кредит (комбинированный вариант)',
    ),
  },
  purchaseBudgetUsd: {
    up_to_100k: L('Մինչև 100,000 ԱՄՆ դոլար', 'Up to USD 100,000', 'До 100,000 долларов США'),
    '100k-150k': L(
      '100,000–150,000 ԱՄՆ դոլար',
      'USD 100,000–150,000',
      '100,000–150,000 долларов США',
    ),
    '150k-250k': L(
      '150,000–250,000 ԱՄՆ դոլար',
      'USD 150,000–250,000',
      '150,000–250,000 долларов США',
    ),
    '250k-500k': L(
      '250,000–500,000 ԱՄՆ դոլար',
      'USD 250,000–500,000',
      '250,000–500,000 долларов США',
    ),
    '500k_plus': L('500,000 ԱՄՆ դոլար +', 'USD 500,000+', '500,000 долларов США +'),
  },
  armeniaVisitTiming: {
    within_1_month: L('1 ամսվա ընթացքում', 'Within 1 month', 'В течение 1 месяца'),
    within_3_months: L('3 ամսվա ընթացքում', 'Within 3 months', 'В течение 3 месяцев'),
    within_6_months: L('6 ամսվա ընթացքում', 'Within 6 months', 'В течение 6 месяцев'),
    within_1_year: L('Տարվա ընթացքում', 'Within a year', 'В течение года'),
    not_planning: L(
      'Դեռ չեմ նախատեսում ուղևորություն',
      'I am not planning a trip yet',
      'Пока не планирую поездку',
    ),
  },
  investmentGoal: {
    ...questionnaireI18n.options.investmentGoal,
    capital_preservation: L(
      'Կապիտալը պահպանելու համար',
      'To preserve capital',
      'Для сохранения капитала',
    ),
  },
  researchGoal: {
    future_purchase_armenia: L(
      'Ապագայում Հայաստանում բնակարան գնելու համար',
      'To purchase a home in Armenia in the future',
      'Для покупки жилья в Армении в будущем',
    ),
    possible_relocation: L(
      'Հնարավոր տեղափոխության համար դեպի Հայաստան',
      'For a possible move to Armenia',
      'Для возможного переезда в Армению',
    ),
    future_investment: questionnaireI18n.options.researchGoal.future_investment,
    professional: questionnaireI18n.options.researchGoal.professional,
    browse_offers: questionnaireI18n.options.researchGoal.browse_offers,
  },
} as const;

const optionFallback = {
  ageBand: 'ageBand',
  visitPurpose: 'visitPurpose',
  areaSqm: 'areaSqm',
  decisionStage: 'decisionStage',
  investmentPropertyType: 'investmentPropertyType',
  investmentTimeline: 'investmentTimeline',
  investmentBudgetUsd: 'investmentBudgetUsd',
  priorInvestmentExperience: 'priorInvestmentExperience',
  marketInterest: 'marketInterest',
  purchaseHorizon: 'purchaseHorizon',
  newsletter: 'newsletter',
} as const satisfies Record<string, keyof typeof questionnaireI18n.options>;

export type SpyurkOptionGroup = keyof typeof spyurkOptions | keyof typeof optionFallback;

export const spyurkQuestionnaireI18n = {
  questions: { ...questionnaireI18n.questions, ...spyurkQuestions },
  options: { ...questionnaireI18n.options, ...spyurkOptions },
} as const;

export function getSpyurkQuestionLabel(
  key: SpyurkQuestionKey,
  locale: QuestionnaireLocale,
): string {
  if (key in spyurkQuestions) {
    return getQuestionnaireLabel(spyurkQuestions[key as keyof typeof spyurkQuestions], locale);
  }
  const fallback = questionFallback[key as keyof typeof questionFallback];
  return getQuestionnaireLabel(questionnaireI18n.questions[fallback], locale);
}

export function getSpyurkOptionLabel(
  group: SpyurkOptionGroup,
  value: string,
  locale: QuestionnaireLocale,
): string {
  if (group in spyurkOptions) {
    const groupMap = spyurkOptions[group as keyof typeof spyurkOptions] as Record<
      string,
      Localized
    >;
    const entry = groupMap[value];
    if (entry) {
      return getQuestionnaireLabel(entry, locale);
    }
  }
  const fallback = optionFallback[group as keyof typeof optionFallback];
  if (fallback) {
    const groupMap = questionnaireI18n.options[fallback] as Record<string, Localized>;
    const entry = groupMap[value];
    if (entry) {
      return getQuestionnaireLabel(entry, locale);
    }
  }
  return value;
}
