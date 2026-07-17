export type QuestionnaireLocale = 'hy' | 'en' | 'ru';

type Localized = Record<QuestionnaireLocale, string>;

function L(hy: string, en: string, ru: string): Localized {
  return { hy, en, ru };
}

/** Question prompts and option labels for form version 2026-vis-reg-v1. */
export const questionnaireI18n = {
  questions: {
    ageBand: L(
      'Տարիք',
      'Age',
      'Возраст',
    ),
    visitPurpose: L(
      'Ձեր այցի հիմնական նպատակը TOON EXPO-ին',
      'What is the main purpose of your visit to TOON EXPO?',
      'Какова основная цель вашего визита на TOON EXPO?',
    ),
    interestType: L(
      'Ձեզ հետաքրքրում է',
      'What are you interested in?',
      'Что вас интересует?',
    ),
    abroadCountries: L(
      'Գույք արտերկրում — երկիր',
      'Property abroad — country',
      'Недвижимость за рубежом — страна',
    ),
    abroadCountriesOther: L(
      'Այլ (խնդրում ենք նշել)',
      'Other (please specify)',
      'Другое (укажите)',
    ),
    locationSeek: L(
      'Որտե՞ղ եք փնտրում անշարժ գույք',
      'Where are you looking for real estate?',
      'Где вы ищете недвижимость?',
    ),
    yerevanDistricts: L(
      'Երևան — վարչական շրջան',
      'Yerevan — district',
      'Ереван — административный район',
    ),
    marzRegions: L(
      'Մարզ',
      'Region (marz)',
      'Марз (область)',
    ),
    areaSqm: L(
      'Քանի՞ քմ մակերեսով անշարժ գույք եք փնտրում',
      'What property size (sqm) are you looking for?',
      'Какую площадь недвижимости (м²) вы ищете?',
    ),
    purchaseMethod: L(
      'Ո՞ր եղանակով եք ցանկանում ձեռք բերել անշարժ գույք',
      'How do you want to purchase the property?',
      'Каким способом вы хотите приобрести недвижимость?',
    ),
    monthlyBudget: L(
      'Ի՞նչ ամսական վճարման բյուջե եք դիտարկում',
      'What monthly payment budget are you considering?',
      'Какой бюджет ежемесячного платежа вы рассматриваете?',
    ),
    decisionStage: L(
      'Ո՞ր փուլում եք գտնվում',
      'What stage are you at?',
      'На каком этапе вы находитесь?',
    ),
    investmentPropertyType: L(
      'Ո՞ր տեսակի ներդրումային գույքն է Ձեզ առավել հետաքրքրում',
      'Which type of investment property interests you most?',
      'Какой тип инвестиционной недвижимости вас больше всего интересует?',
    ),
    investmentPropertyTypeOther: L(
      'Այլ (խնդրում ենք նշել)',
      'Other (please specify)',
      'Другое (укажите)',
    ),
    investmentMarket: L(
      'Ո՞ր շուկայում եք դիտարկում ներդրում',
      'In which market are you considering an investment?',
      'На каком рынке вы рассматриваете инвестицию?',
    ),
    investmentMarketOther: L(
      'Այլ (խնդրում ենք նշել)',
      'Other (please specify)',
      'Другое (укажите)',
    ),
    investmentGoal: L(
      'Ի՞նչ նպատակով եք կատարում ներդրումը',
      'What is the goal of your investment?',
      'С какой целью вы делаете инвестицию?',
    ),
    investmentTimeline: L(
      'Որքա՞ն շուտ եք պատրաստ կայացնել ներդրումային որոշումը',
      'How soon are you ready to make an investment decision?',
      'Как скоро вы готовы принять инвестиционное решение?',
    ),
    investmentBudgetUsd: L(
      'Ո՞ր ներդրումային բյուջեն եք դիտարկում',
      'What investment budget are you considering?',
      'Какой инвестиционный бюджет вы рассматриваете?',
    ),
    priorInvestmentExperience: L(
      'Նախկինում ներդրում կատարել եք անշարժ գույքում',
      'Have you invested in real estate before?',
      'Инвестировали ли вы ранее в недвижимость?',
    ),
    marketInterests: L(
      'Ի՞նչն է Ձեզ առավել հետաքրքրում անշարժ գույքի շուկայում',
      'What interests you most in the real estate market?',
      'Что вас больше всего интересует на рынке недвижимости?',
    ),
    researchGoal: L(
      'Ի՞նչ նպատակով եք ուսումնասիրում շուկան',
      'Why are you researching the market?',
      'С какой целью вы изучаете рынок?',
    ),
    interestedWhere: L(
      'Ո՞րտեղի անշարժ գույքով եք հետաքրքրված',
      'Where are you interested in real estate?',
      'Недвижимость какого региона вас интересует?',
    ),
    interestedWhereOther: L(
      'Խնդրում ենք նշել երկիրը',
      'Please specify the country',
      'Пожалуйста, укажите страну',
    ),
    purchaseHorizon: L(
      'Ե՞րբ եք հնարավոր համարում անշարժ գույքի ձեռքբերումը',
      'When do you consider purchasing real estate possible?',
      'Когда вы считаете возможным приобретение недвижимости?',
    ),
    newsletter: L(
      'Կցանկանա՞ք ցուցահանդեսից հետո ստանալ ոլորտային նորություններ, վերլուծություններ և հատուկ առաջարկներ',
      'Would you like to receive industry news, analysis, and special offers after the exhibition?',
      'Хотели бы вы получать отраслевые новости, аналитику и специальные предложения после выставки?',
    ),
  },
  options: {
    ageBand: {
      '18-24': L('18-24 տարեկան', '18–24 years', '18–24 лет'),
      '25-34': L('25-34 տարեկան', '25–34 years', '25–34 лет'),
      '35-44': L('35-44 տարեկան', '35–44 years', '35–44 лет'),
      '45-54': L('45-54 տարեկան', '45–54 years', '45–54 лет'),
      '55-64': L('55-64 տարեկան', '55–64 years', '55–64 лет'),
      '65_plus': L('65 +', '65+', '65+'),
    },
    visitPurpose: {
      own_residence: L(
        'Անշարժ գույքի գնում սեփական բնակության համար',
        'Buying property for own residence',
        'Покупка недвижимости для собственного проживания',
      ),
      investment: L(
        'Հետաքրքրված եմ ներդրումներով',
        'Interested in investments',
        'Интересуюсь инвестициями',
      ),
      market_research: L(
        'Շուկայի ուսումնասիրություն և ծանոթացում',
        'Market research and exploration',
        'Изучение рынка и ознакомление',
      ),
    },
    interestType: {
      house_townhouse: L(
        'Առանձնատուն / Թաունհաուս',
        'House / townhouse',
        'Частный дом / таунхаус',
      ),
      apartment_new: L(
        'Բնակարան կառուցապատողից (նորակառույց)',
        'Apartment from a developer (new build)',
        'Квартира от застройщика (новостройка)',
      ),
      abroad: L('Գույք արտերկրում', 'Property abroad', 'Недвижимость за рубежом'),
    },
    abroadCountry: {
      uae: L('ԱՄԷ', 'UAE', 'ОАЭ'),
      russia: L('Ռուսաստանի Դաշնություն', 'Russian Federation', 'Российская Федерация'),
      spain: L('Իսպանիա', 'Spain', 'Испания'),
      cyprus: L('Կիպրոս', 'Cyprus', 'Кипр'),
      georgia: L('Վրաստան', 'Georgia', 'Грузия'),
      other: L('Այլ', 'Other', 'Другое'),
    },
    locationSeekScope: {
      yerevan: L('Երևան', 'Yerevan', 'Ереван'),
      marz: L('Մարզ', 'Region (marz)', 'Марз'),
      abroad: L('Արտերկիր', 'Abroad', 'За рубежом'),
    },
    yerevanDistrict: {
      kentron: L('Կենտրոն', 'Kentron', 'Кентрон'),
      arabkir: L('Արաբկիր', 'Arabkir', 'Арабкир'),
      ajapnyak: L('Աջափնյակ', 'Ajapnyak', 'Аджапняк'),
      davtashen: L('Դավթաշեն', 'Davtashen', 'Давташен'),
      nor_nork: L('Նոր Նորք', 'Nor Nork', 'Нор Норк'),
      avan: L('Ավան', 'Avan', 'Аван'),
      kanaker_zeytun: L('Քանաքեռ-Զեյթուն', 'Kanaker-Zeytun', 'Канакер-Зейтун'),
      nork_marash: L('Նորք-Մարաշ', 'Nork-Marash', 'Норк-Мараш'),
      shengavit: L('Շենգավիթ', 'Shengavit', 'Шенгавит'),
      malatia_sebastia: L('Մալաթիա-Սեբաստիա', 'Malatia-Sebastia', 'Малатия-Себастия'),
      erebuni: L('Էրեբունի', 'Erebuni', 'Эребуни'),
      nubarashen: L('Նուբարաշեն', 'Nubarashen', 'Нубарашен'),
    },
    marzRegion: {
      aragatsotn: L('Արագածոտնի մարզ', 'Aragatsotn', 'Арагацотн'),
      ararat: L('Արարատի մարզ', 'Ararat', 'Арарат'),
      armavir: L('Արմավիրի մարզ', 'Armavir', 'Армавир'),
      gegharkunik: L('Գեղարքունիքի մարզ', 'Gegharkunik', 'Гегаркуник'),
      lori: L('Լոռու մարզ', 'Lori', 'Лори'),
      kotayk: L('Կոտայքի մարզ', 'Kotayk', 'Котайк'),
      shirak: L('Շիրակի մարզ', 'Shirak', 'Ширак'),
      syunik: L('Սյունիքի մարզ', 'Syunik', 'Сюник'),
      vayots_dzor: L('Վայոց ձորի մարզ', 'Vayots Dzor', 'Вайоц Дзор'),
      tavush: L('Տավուշի մարզ', 'Tavush', 'Тавуш'),
    },
    areaSqm: {
      up_to_50: L('Մինչև 50 քմ', 'Up to 50 sqm', 'До 50 м²'),
      '50-70': L('50-70 քմ', '50–70 sqm', '50–70 м²'),
      '70-90': L('70-90 քմ', '70–90 sqm', '70–90 м²'),
      '90-120': L('90-120 քմ', '90–120 sqm', '90–120 м²'),
      '120_plus': L('120 քմ +', '120 sqm+', '120 м²+'),
    },
    purchaseMethod: {
      cash: L('Կանխիկ', 'Cash', 'Наличные'),
      mortgage: L('Բնակարանային հիփոթեք', 'Residential mortgage', 'Ипотека'),
      installment: L(
        'Տարաժամկետ վճարում (Կառուցապատողի ապառիկ)',
        'Installment (developer plan)',
        'Рассрочка (от застройщика)',
      ),
      mixed: L(
        'Կանխիկ + Հիփոթեքային վարկ (Խառը տարբերակ)',
        'Cash + mortgage (mixed)',
        'Наличные + ипотека (смешанный вариант)',
      ),
    },
    monthlyBudget: {
      up_to_300k: L('Մինչև 300․000 դր', 'Up to AMD 300,000', 'До 300 000 драм'),
      '300k-500k': L('300․000-500․000 դր', 'AMD 300,000–500,000', '300 000–500 000 драм'),
      '500k-700k': L('500․000-700․000 դր', 'AMD 500,000–700,000', '500 000–700 000 драм'),
      '700k-1m': L('700․000-1․000․000 դր', 'AMD 700,000–1,000,000', '700 000–1 000 000 драм'),
      '1m_plus': L('1․000․000 դր +', 'AMD 1,000,000+', '1 000 000 драм+'),
      paying_cash: L(
        'Ձեռք եմ բերելու կանխիկ',
        'I will pay in cash',
        'Приобрету за наличные',
      ),
    },
    decisionStage: {
      ready_1_month: L(
        'Պատրաստ եմ գործարք իրականացնել մոտ ժամանակում (մինչև 1 ամիս)',
        'Ready to close soon (within 1 month)',
        'Готов(а) к сделке в ближайшее время (до 1 месяца)',
      ),
      choosing_3_months: L(
        'Ընտրել եմ մի քանի տարբերակ և նախատեսում եմ որոշում կայացնել (մինչև 3 ամսվա ընթացքում)',
        'Comparing options; decide within 3 months',
        'Выбрал(а) несколько вариантов; решение в течение 3 месяцев',
      ),
      searching_6_months: L(
        'Ակտիվ փնտրում եմ և նախատեսում եմ որոշում կայացնել (մինչև 6 ամսվա ընթացքում)',
        'Actively searching; decide within 6 months',
        'Активно ищу; решение в течение 6 месяцев',
      ),
      just_researching: L(
        'Պարզապես ուսումնասիրում եմ շուկան',
        'Just researching the market',
        'Просто изучаю рынок',
      ),
    },
    investmentPropertyType: {
      apartment: L('Բնակարան', 'Apartment', 'Квартира'),
      apart_hotel: L('Ապարտ-հյուրանոց (Apart Hotel)', 'Apart hotel', 'Апарт-отель'),
      commercial: L('Առևտրային տարածք', 'Commercial space', 'Коммерческое помещение'),
      office: L('Գրասենյակային տարածք', 'Office space', 'Офисное помещение'),
      land: L('Հողատարածք', 'Land', 'Земельный участок'),
      house_villa: L('Առանձնատուն / վիլլա', 'House / villa', 'Дом / вилла'),
      other: L('Այլ', 'Other', 'Другое'),
    },
    investmentMarket: {
      armenia: L('Հայաստան', 'Armenia', 'Армения'),
      uae: L('ԱՄԷ', 'UAE', 'ОАЭ'),
      greece: L('Հունաստան', 'Greece', 'Греция'),
      spain: L('Իսպանիա', 'Spain', 'Испания'),
      cyprus: L('Կիպրոս', 'Cyprus', 'Кипр'),
      montenegro: L('Մոնտենեգրո', 'Montenegro', 'Черногория'),
      other: L('Այլ', 'Other', 'Другое'),
    },
    investmentGoal: {
      rental_income: L(
        'Վարձակալությունից պասիվ եկամուտ ստանալու համար',
        'Passive income from rent',
        'Пассивный доход от аренды',
      ),
      appreciation: L(
        'Գույքի արժեքի աճից շահույթ ստանալու համար',
        'Profit from property appreciation',
        'Прибыль от роста стоимости',
      ),
      diversification: L(
        'Ներդրումային պորտֆելը դիվերսիֆիկացնելու համար',
        'Diversify investment portfolio',
        'Диверсификация инвестиционного портфеля',
      ),
      citizenship_residency: L(
        'Քաղաքացիության / ռեզիդենտության ծրագրերի համար',
        'Citizenship / residency programs',
        'Программы гражданства / резидентства',
      ),
      multiple: L(
        'Միաժամանակ մի քանի նպատակով',
        'Several goals at once',
        'Несколько целей одновременно',
      ),
    },
    investmentTimeline: {
      '1_month': L('1 ամսվա ընթացքում', 'Within 1 month', 'В течение 1 месяца'),
      '3_months': L('3 ամսվա ընթացքում', 'Within 3 months', 'В течение 3 месяцев'),
      '6_months': L('6 ամսվա ընթացքում', 'Within 6 months', 'В течение 6 месяцев'),
      '12_months': L('12 ամսվա ընթացքում', 'Within 12 months', 'В течение 12 месяцев'),
      just_researching: L(
        'Պարզապես ուսումնասիրում եմ շուկան',
        'Just researching the market',
        'Просто изучаю рынок',
      ),
    },
    investmentBudgetUsd: {
      up_to_100k: L(
        'Մինչև 100,000 ԱՄՆ դոլար',
        'Up to USD 100,000',
        'До 100 000 долларов США',
      ),
      '100k-250k': L(
        '100,000 – 250,000 ԱՄՆ դոլար',
        'USD 100,000–250,000',
        '100 000–250 000 долларов США',
      ),
      '250k-500k': L(
        '250,000 – 500,000 ԱՄՆ դոլար',
        'USD 250,000–500,000',
        '250 000–500 000 долларов США',
      ),
      '500k_plus': L(
        '500,000 ԱՄՆ դոլար +',
        'USD 500,000+',
        '500 000 долларов США+',
      ),
    },
    priorInvestmentExperience: {
      yes_armenia: L('Այո, Հայաստանում', 'Yes, in Armenia', 'Да, в Армении'),
      yes_abroad: L('Այո, արտերկրում', 'Yes, abroad', 'Да, за рубежом'),
      yes_both: L(
        'Այո, և Հայաստանում, և արտերկրում',
        'Yes, both in Armenia and abroad',
        'Да, и в Армении, и за рубежом',
      ),
      no_first: L(
        'Ոչ, սա կլինի առաջին ներդրումս',
        'No, this will be my first investment',
        'Нет, это будет моя первая инвестиция',
      ),
    },
    marketInterest: {
      new_apartments: L(
        'Նորակառույց բնակարաններ',
        'New-build apartments',
        'Новостройки',
      ),
      houses_townhouses: L(
        'Առանձնատներ և թաունհաուսներ',
        'Houses and townhouses',
        'Частные дома и таунхаусы',
      ),
      investment_opportunities: L(
        'Ներդրումային հնարավորություններ',
        'Investment opportunities',
        'Инвестиционные возможности',
      ),
      foreign_property: L(
        'Արտասահմանյան անշարժ գույք',
        'Foreign real estate',
        'Зарубежная недвижимость',
      ),
      mortgage_programs: L(
        'Հիփոթեքային ծրագրեր',
        'Mortgage programs',
        'Ипотечные программы',
      ),
      price_trends: L(
        'Շուկայի գնային միտումներ',
        'Market price trends',
        'Ценовые тренды рынка',
      ),
      developer_offers: L(
        'Կառուցապատողների առաջարկներ',
        'Developer offers',
        'Предложения застройщиков',
      ),
      urban_projects: L(
        'Քաղաքաշինական նոր նախագծեր',
        'New urban development projects',
        'Новые градостроительные проекты',
      ),
    },
    researchGoal: {
      future_purchase: L(
        'Ապագա բնակարան գնելու համար',
        'For a future home purchase',
        'Для будущей покупки жилья',
      ),
      future_investment: L(
        'Ապագա ներդրում կատարելու համար',
        'For a future investment',
        'Для будущей инвестиции',
      ),
      professional: L(
        'Մասնագիտական հետաքրքրությունից ելնելով',
        'Professional interest',
        'Из профессионального интереса',
      ),
      browse_offers: L(
        'Պարզապես ցանկանում եմ ծանոթանալ առաջարկներին',
        'Just browsing offers',
        'Просто хочу ознакомиться с предложениями',
      ),
    },
    interestedWhere: {
      yerevan: L('Երևան', 'Yerevan', 'Ереван'),
      regions: L('ՀՀ մարզեր', 'Armenian regions', 'Регионы Армении'),
      abroad: L('Արտերկիր', 'Abroad', 'За рубежом'),
      undecided: L('Դեռ չեմ կողմնորոշվել', 'Not decided yet', 'Пока не определился(ась)'),
    },
    purchaseHorizon: {
      within_1_year: L('Մինչև 1 տարի', 'Within 1 year', 'В течение 1 года'),
      '1-2_years': L('1-2 տարի հետո', 'In 1–2 years', 'Через 1–2 года'),
      '2-5_years': L('2-5 տարի հետո', 'In 2–5 years', 'Через 2–5 лет'),
      no_plans: L(
        'Այս պահին նման պլան չունեմ',
        'No such plans at the moment',
        'На данный момент таких планов нет',
      ),
    },
    newsletter: {
      yes: L('Այո', 'Yes', 'Да'),
      no: L('Ոչ', 'No', 'Нет'),
    },
  },
} as const;

/**
 * Resolve a localized questionnaire string for the given locale.
 */
export function getQuestionnaireLabel(
  localized: Localized,
  locale: QuestionnaireLocale,
): string {
  return localized[locale];
}
