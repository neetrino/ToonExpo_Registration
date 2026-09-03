export type QuestionnaireLocale = 'hy' | 'en' | 'ru';

type Localized = Record<QuestionnaireLocale, string>;

function L(hy: string, en: string, ru: string): Localized {
  return { hy, en, ru };
}

/** Question prompts and option labels for form version 2026-vis-reg-v2. */
export const questionnaireI18n = {
  questions: {
    ageBand: L('Տարիք', 'Age', 'Возраст'),
    residence: L('Բնակության վայր', 'Place of Residence', 'Место проживания'),
    residenceDistrict: L('Երևան', 'Yerevan', 'Ереван'),
    residenceRegion: L('Մարզ', 'Region', 'Области Армении'),
    residenceCountry: L(
      'Արտերկիր (խնդրում ենք նշել երկիրը)',
      'Abroad — please specify the country',
      'За рубежом (укажите страну)',
    ),
    visitPurpose: L(
      'Ձեր այցի հիմնական նպատակը TOON EXPO-ին',
      'What is the main purpose of your visit to TOON EXPO?',
      'Основная цель посещения TOON EXPO',
    ),
    interestType: L(
      'Ձեզ հետաքրքրում է',
      'What type of property are you interested in?',
      'Какая недвижимость Вас интересует?',
    ),
    abroadCountries: L(
      'Գույք արտերկրում — երկիր',
      'Property abroad — country',
      'Недвижимость за рубежом — страна',
    ),
    abroadCountriesOther: L('Այլ (խնդրում ենք նշել)', 'Other (please specify)', 'Другое (укажите)'),
    locationSeek: L(
      'Որտե՞ղ եք փնտրում անշարժ գույք',
      'Where are you looking for real estate?',
      'Где Вы ищете недвижимость?',
    ),
    investmentLocation: L(
      'Որտե՞ղ եք դիտարկում ներդրումային գույք ձեռք բերել',
      'Which market are you considering for investment?',
      'На каком рынке вы рассматриваете инвестиции',
    ),
    locationSeekOther: L(
      'Խնդրում ենք նշել երկիրը',
      'Please specify the country',
      'Пожалуйста, укажите страну',
    ),
    yerevanDistricts: L('Երևան', 'Yerevan', 'Ереван'),
    marzRegions: L('Մարզ', 'Region', 'Области Армении'),
    areaSqm: L(
      'Քանի՞ քմ մակերեսով անշարժ գույք եք փնտրում',
      'What property size are you looking for?',
      'Какую площадь недвижимости вы ищете',
    ),
    purchaseMethod: L(
      'Ո՞ր եղանակով եք ցանկանում ձեռք բերել անշարժ գույք',
      'How are you planning to purchase the property?',
      'Каким способом вы планируете приобрести недвижимость',
    ),
    monthlyBudget: L(
      'Ի՞նչ ամսական վճարման բյուջե եք դիտարկում',
      'What monthly payment budget are you considering?',
      'Какой бюджет ежемесячного платежа вы рассматриваете?',
    ),
    decisionStage: L(
      'Ո՞ր փուլում եք գտնվում',
      'What stage are you currently at?',
      'На каком этапе вы находитесь',
    ),
    investmentPropertyType: L(
      'Ո՞ր տեսակի ներդրումային գույքն է Ձեզ առավել հետաքրքրում',
      'What type of investment property interests you most?',
      'Какой тип инвестиционной недвижимости вас интересует больше всего',
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
      'What is the main purpose of your investment?',
      'С какой целью вы осуществляете инвестицию',
    ),
    investmentTimeline: L(
      'Որքա՞ն շուտ եք պատրաստ կայացնել ներդրումային որոշումը',
      'How soon are you prepared to make an investment decision?',
      'Как скоро вы готовы принять инвестиционное решение',
    ),
    investmentBudgetUsd: L(
      'Ո՞ր ներդրումային բյուջեն եք դիտարկում',
      'What investment budget are you considering?',
      'Какой инвестиционный бюджет вы рассматриваете?',
    ),
    priorInvestmentExperience: L(
      'Նախկինում ներդրում կատարել եք անշարժ գույքում',
      'Have you previously invested in real estate?',
      'Ранее вы инвестировали в недвижимость',
    ),
    priorInvestmentExperienceOther: L(
      'Խնդրում ենք նշել երկիրը',
      'Please specify the country',
      'Пожалуйста, укажите страну',
    ),
    marketInterests: L(
      'Ի՞նչն է Ձեզ առավել հետաքրքրում անշարժ գույքի շուկայում',
      'What interests you most in the real estate market?',
      'Что вас больше всего интересует на рынке недвижимости?',
    ),
    researchGoal: L(
      'Ի՞նչ նպատակով եք ուսումնասիրում շուկան',
      'What is your main purpose for researching the market?',
      'С какой целью вы изучаете рынок',
    ),
    interestedWhere: L(
      'Որտե՞ղ գտնվող անշարժ գույքով եք հետաքրքրված',
      'Which real estate market are you interested in?',
      'Недвижимость в каком регионе вас интересует',
    ),
    interestedWhereOther: L(
      'Խնդրում ենք նշել երկիրը',
      'Please specify the country',
      'Пожалуйста, укажите страну',
    ),
    purchaseHorizon: L(
      'Ե՞րբ եք հնարավոր համարում անշարժ գույքի ձեռքբերումը',
      'When do you consider purchasing real estate?',
      'Когда вы считаете возможным приобретение недвижимости',
    ),
    newsletter: L(
      'Կցանկանա՞ք ցուցահանդեսից հետո ստանալ ոլորտային նորություններ, վերլուծություններ և հատուկ առաջարկներ',
      'Would you like to receive industry news, market analysis, and special offers after the exhibition?',
      'Хотели бы вы после выставки получать отраслевые новости, аналитику и специальные предложения',
    ),
  },
  options: {
    ageBand: {
      '18-24': L('18-24 տարեկան', '18–24', '18–24 года'),
      '25-34': L('25-34 տարեկան', '25–34', '25–34 года'),
      '35-44': L('35-44 տարեկան', '35–44', '35–44 года'),
      '45-54': L('45-54 տարեկան', '45–54', '45–54 года'),
      '55-64': L('55-64 տարեկան', '55–64', '55–64 года'),
      '65_plus': L('65 +', '65+', '65+'),
    },
    visitPurpose: {
      own_residence: L(
        'Անշարժ գույքի գնում սեփական բնակության համար',
        'Purchasing real estate for personal residence',
        'Покупка недвижимости для себя или семьи',
      ),
      investment: L(
        'Հետաքրքրված եմ ներդրումներով',
        'Interested in real estate investment',
        'Инвестиции в недвижимость',
      ),
      market_research: L(
        'Շուկայի ուսումնասիրություն և ծանոթացում',
        'Market research and exploring available offers',
        'Изучение рынка и знакомство с предложениями',
      ),
    },
    interestType: {
      house_townhouse: L(
        'Առանձնատուն / Թաունհաուս',
        'Private house / Townhouse',
        'Частный дом / вилла / таунхаус',
      ),
      apartment_new: L(
        'Բնակարան կառուցապատողից (նորակառույց)',
        'Apartment from a developer / New-build apartment',
        'Квартира в новостройке от застройщика',
      ),
      abroad: L('Գույք արտերկրում', 'Property abroad', 'Недвижимость за рубежом'),
    },
    abroadCountry: {
      uae: L('ԱՄԷ', 'UAE', 'ОАЭ'),
      russia: L('Ռուսաստան', 'Russia', 'Россия'),
      spain: L('Իսպանիա', 'Spain', 'Испания'),
      cyprus: L('Կիպրոս', 'Cyprus', 'Кипр'),
      georgia: L('Վրաստան', 'Georgia', 'Грузия'),
      italy: L('Իտալիա', 'Italy', 'Италия'),
      bali: L('Բալի', 'Bali', 'Бали'),
      other: L('Այլ', 'Other', 'Другое'),
    },
    locationSeekScope: {
      yerevan: L('Երևան', 'Yerevan', 'Ереван'),
      marz: L('Մարզ', 'Region', 'Области Армении'),
      abroad: L('Արտերկիր', 'Abroad', 'За рубежом'),
      undecided: L('Դեռ չեմ կողմնորոշվել', 'I have not decided yet', 'Пока не определился(ась)'),
    },
    yerevanDistrict: {
      kentron: L('Կենտրոն', 'Kentron', 'Кентрон'),
      arabkir: L('Արաբկիր', 'Arabkir', 'Арабкир'),
      ajapnyak: L('Աջափնյակ', 'Ajapnyak', 'Ачапняк'),
      davtashen: L('Դավթաշեն', 'Davtashen', 'Давташен'),
      nor_nork: L('Նոր Նորք', 'Nor Nork', 'Нор-Норк'),
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
      vayots_dzor: L('Վայոց ձորի մարզ', 'Vayots Dzor', 'Вайоцдзор'),
      tavush: L('Տավուշի մարզ', 'Tavush', 'Тавуш'),
    },
    areaSqm: {
      up_to_50: L('Մինչև 50 քմ', 'Up to 50 sq. m', 'До 50 кв. м'),
      '50-70': L('50 - 70 քմ', '50–70 sq. m', '50–70 кв. м'),
      '70-90': L('70 - 90 քմ', '70–90 sq. m', '70–90 кв. м'),
      '90-120': L('90 - 120 քմ', '90–120 sq. m', '90–120 кв. м'),
      '120_plus': L('120 քմ +', '120+ sq. m', '120 кв. м +'),
    },
    purchaseMethod: {
      cash: L('Կանխիկ', 'Cash', 'Наличными'),
      mortgage: L('Բնակարանային հիփոթեք', 'Mortgage', 'Ипотечный кредит'),
      installment: L(
        'Տարաժամկետ վճարում (Կառուցապատողի ապառիկ)',
        'Installment payment plan offered by the developer',
        'Рассрочка (рассрочка от застройщика)',
      ),
      mixed: L(
        'Կանխիկ + Հիփոթեքային վարկ (Խառը տարբերակ)',
        'Cash + Mortgage — combined option',
        'Наличные + ипотечный кредит (комбинированный вариант)',
      ),
    },
    monthlyBudget: {
      up_to_300k: L('Մինչև 300․000 դր', 'Up to AMD 300,000', 'До 300․000 драмов'),
      '300k-500k': L('300․000 - 500․000 դր', 'AMD 300,000–500,000', '300․000–500․000 драмов'),
      '500k-700k': L('500․000 - 700․000 դր', 'AMD 500,000–700,000', '500․000–700․000 драмов'),
      '700k-1m': L('700․000 - 1․000․000 դր', 'AMD 700,000–1,000,000', '700․000–1․000․000 драмов'),
      '1m_plus': L('1․000․000 դր +', 'AMD 1,000,000+', '1․000․000 драмов +'),
      paying_cash: L(
        'Ձեռք եմ բերելու կանխիկ',
        'I plan to purchase in cash',
        'Планирую приобрести за наличные',
      ),
    },
    decisionStage: {
      ready_1_month: L(
        'Պատրաստ եմ գործարք իրականացնել մոտ ժամանակում (մինչև 1 ամիս)',
        'I am ready to complete a transaction in the near future — within 1 month',
        'Готов(а) совершить сделку в ближайшее время (до 1 месяца)',
      ),
      choosing_3_months: L(
        'Ընտրել եմ մի քանի տարբերակ և նախատեսում եմ որոշում կայացնել (մինչև 3 ամսվա ընթացքում)',
        'I have selected several options and plan to make a decision within 3 months',
        'Выбрал(а) несколько вариантов и планирую принять решение (в течение 3 месяцев)',
      ),
      searching_6_months: L(
        'Ակտիվ փնտրում եմ և նախատեսում եմ որոշում կայացնել (մինչև 6 ամսվա ընթացքում)',
        'I am actively searching and plan to make a decision within 6 months',
        'Активно ищу и планирую принять решение (в течение 6 месяцев)',
      ),
      just_researching: L(
        'Պարզապես ուսումնասիրում եմ շուկան',
        'I am simply researching the market',
        'Просто изучаю рынок',
      ),
    },
    investmentPropertyType: {
      apartment: L('Բնակարան', 'Apartment', 'Квартира'),
      apart_hotel: L('Ապարտ-հյուրանոց (Apart Hotel)', 'Apart Hotel', 'Апарт-отель (Apart Hotel)'),
      commercial: L('Առևտրային տարածք', 'Commercial property', 'Коммерческое помещение'),
      office: L('Գրասենյակային տարածք', 'Office space', 'Офисное помещение'),
      land: L('Հողատարածք', 'Land', 'Земельный участок'),
      house_villa: L('Առանձնատուն / վիլլա', 'Private house / Villa', 'Частный дом / вилла'),
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
        'To generate passive rental income',
        'Для получения пассивного дохода от аренды',
      ),
      appreciation: L(
        'Գույքի արժեքի աճից շահույթ ստանալու համար',
        'To profit from property value appreciation',
        'Для получения прибыли от роста стоимости недвижимости',
      ),
      diversification: L(
        'Ներդրումային պորտֆելը դիվերսիֆիկացնելու համար',
        'To diversify my investment portfolio',
        'Для диверсификации инвестиционного портфеля',
      ),
      citizenship_residency: L(
        'Քաղաքացիության / ռեզիդենտության ծրագրերի համար',
        'To participate in citizenship / residency programs',
        'Для участия в программах получения гражданства / резидентства',
      ),
      multiple: L(
        'Միաժամանակ մի քանի նպատակով',
        'Multiple purposes simultaneously',
        'Одновременно для нескольких целей',
      ),
    },
    investmentTimeline: {
      up_to_3_months: L('Մինչև 3 ամսվա ընթացքում', 'Within 3 months', 'В течение 3 месяцев'),
      '3-6_months': L('3 - 6 ամսվա ընթացքում', 'Within 3–6 months', 'В течение 3-6 месяцев'),
      '6-12_months': L('6 - 12 ամսվա ընթացքում', 'Within 6–12 months', 'В течение 6-12 месяцев'),
      '1-2_years': L('1 -2 տարվա ընթացքում', 'Within 1–2 years', 'В течение 1-2 лет'),
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
      up_to_150k: L('Մինչև 150,000 ԱՄՆ դոլար', 'Up to USD 150,000', 'До 150,000 долларов США'),
      '150k-300k': L(
        '150,000 - 300,000 ԱՄՆ դոլար',
        'USD 150,000–300,000',
        '150,000–300,000 долларов США',
      ),
      '300k-500k': L(
        '300,000 - 500,000 ԱՄՆ դոլար',
        'USD 300,000–500,000',
        '300,000–500,000 долларов США',
      ),
      up_to_100k: L('Մինչև 100,000 ԱՄՆ դոլար', 'Up to USD 100,000', 'До 100 000 долларов США'),
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
      '500k_plus': L('500,000 ԱՄՆ դոլար +', 'USD 500,000+', '500,000 долларов США +'),
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
        'No, this will be my first real estate investment',
        'Нет, это будет моя первая инвестиция',
      ),
    },
    marketInterest: {
      new_apartments: L('Նորակառույց բնակարաններ', 'New-build apartments', 'Квартиры в новостройках'),
      houses_townhouses: L(
        'Առանձնատներ և թաունհաուսներ',
        'Private houses and townhouses',
        'Частные дома и таунхаусы',
      ),
      investment_opportunities: L(
        'Ներդրումային հնարավորություններ',
        'Investment opportunities',
        'Инвестиционные возможности',
      ),
      foreign_property: L(
        'Արտասահմանյան անշարժ գույք',
        'International real estate',
        'Зарубежная недвижимость',
      ),
      mortgage_programs: L('Հիփոթեքային ծրագրեր', 'Mortgage programs', 'Ипотечные программы'),
      price_trends: L('Շուկայի գնային միտումներ', 'Market price trends', 'Ценовые тенденции рынка'),
      developer_offers: L(
        'Կառուցապատողների առաջարկներ',
        'Offers from developers',
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
        'To purchase a home in the future',
        'Для покупки жилья в будущем',
      ),
      future_investment: L(
        'Ապագա ներդրում կատարելու համար',
        'To make an investment in the future',
        'Для осуществления инвестиций в будущем',
      ),
      professional: L(
        'Մասնագիտական հետաքրքրությունից ելնելով',
        'Professional interest',
        'Из профессионального интереса',
      ),
      browse_offers: L(
        'Պարզապես ցանկանում եմ ծանոթանալ առաջարկներին',
        'I simply want to explore the available offers',
        'Просто хочу ознакомиться с предложениями',
      ),
    },
    interestedWhere: {
      yerevan: L('Երևան', 'Yerevan', 'Ереван'),
      regions: L('ՀՀ մարզեր', 'Region', 'Области Армении'),
      abroad: L('Արտերկիր', 'Abroad', 'За рубежом'),
      undecided: L('Դեռ չեմ կողմնորոշվել', 'I have not decided yet', 'Пока не определился(ась)'),
    },
    purchaseHorizon: {
      up_to_3_months: L('Մինչև 3 ամսվա ընթացքում', 'Within 3 months', 'В течение 3 месяцев'),
      '3-6_months': L('3 - 6 ամսվա ընթացքում', 'Within 3–6 months', 'В течение 3-6 месяцев'),
      '6-12_months': L('6 - 12 ամսվա ընթացքում', 'Within 6–12 months', 'В течение 6-12 месяцев'),
      '1-2_years': L('1 - 2 տարվա ընթացքում', 'Within 1–2 years', 'В течение 1-2 лет'),
      no_plans: L(
        'Այս պահին նման պլան չունեմ',
        'I currently have no plans to purchase real estate',
        'На данный момент таких планов нет',
      ),
      within_1_year: L('Մինչև 1 տարի', 'Within 1 year', 'В течение 1 года'),
      '2-5_years': L('2-5 տարի հետո', 'In 2–5 years', 'Через 2–5 лет'),
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
export function getQuestionnaireLabel(localized: Localized, locale: QuestionnaireLocale): string {
  return localized[locale];
}
