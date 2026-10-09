/**
 * Stable Mootq question codes (`code` in the registration schema).
 * Numeric ids are read from the live schema and are not stored here.
 */
export const MOOTQ_QUESTION_CODE = {
  firstName: 'first_name',
  lastName: 'last_name',
  phone: 'phone',
  email: 'email',
  ageBand: 'field_1788873742063',
  residenceScope: 'field_1788874150015',
  residenceYerevan: 'field_1788874713038',
  residenceMarz: 'field_1788875358979',
  residenceAbroad: 'field_1788875563857',
  visitPurpose: 'field_1788875916593',
  interestType: 'field_1788876327517',
  ownAbroadCountries: 'field_1788876670837',
  ownAbroadCountryOther: 'field_1788877116314',
  ownLocationScope: 'field_1788877444248',
  ownYerevan: 'field_1788878044349',
  ownMarz: 'field_1788878571589',
  ownAragatsotnCities: 'field_1791199466669',
  ownAragatsotnOther: 'field_1791199716164',
  ownAraratCities: 'field_1791200028486',
  ownAraratOther: 'field_1791200238306',
  ownKotaykCities: 'field_1791200513275',
  ownKotaykOther: 'field_1791200966398',
  ownAbroadSeek: 'field_1788878978882',
  ownAbroadSeekOther: 'field_1788879139154',
  ownArea: 'field_1788879357726',
  ownPurchaseMethod: 'field_1788879572090',
  monthlyBudget: 'field_1788935456133',
  decisionStage: 'field_1788935775956',
  newsletter: 'field_1788935899274',
  investmentPropertyType: 'field_1788937792774',
  investmentPropertyOther: 'field_1788937939797',
  investmentLocationScope: 'field_1788938194436',
  investmentYerevan: 'field_1788938490326',
  investmentMarz: 'field_1788938750326',
  investmentKotaykCities: 'field_1791202144101',
  investmentKotaykOther: 'field_1791202892647',
  investmentTavushCities: 'field_1791202533971',
  investmentTavushOther: 'field_1791202984734',
  investmentAbroad: 'field_1788939156940',
  investmentAbroadOther: 'field_1788939311856',
  investmentGoal: 'field_1788939608473',
  investmentArea: 'field_1788939787006',
  investmentPurchaseMethod: 'field_1788939945176',
  investmentTimeline: 'field_1788940087548',
  investmentBudget: 'field_1788940522273',
  priorExperience: 'field_1788941284750',
  priorExperienceCountry: 'field_1788941422825',
  marketInterests: 'field_1788944465647',
  researchGoal: 'field_1788944655181',
  researchLocationScope: 'field_1788944842650',
  researchYerevan: 'field_1788945131462',
  researchMarz: 'field_1788945358624',
  researchAbroad: 'field_1788952506699',
  purchaseHorizon: 'field_1788953028919',
} as const;

export type MootqCityQuestions = { cities: string; other: string };

export const OWN_RESIDENCE_CITY_QUESTIONS: Record<string, MootqCityQuestions> = {
  aragatsotn: {
    cities: MOOTQ_QUESTION_CODE.ownAragatsotnCities,
    other: MOOTQ_QUESTION_CODE.ownAragatsotnOther,
  },
  ararat: {
    cities: MOOTQ_QUESTION_CODE.ownAraratCities,
    other: MOOTQ_QUESTION_CODE.ownAraratOther,
  },
  kotayk: {
    cities: MOOTQ_QUESTION_CODE.ownKotaykCities,
    other: MOOTQ_QUESTION_CODE.ownKotaykOther,
  },
};

export const INVESTMENT_CITY_QUESTIONS: Record<string, MootqCityQuestions> = {
  kotayk: {
    cities: MOOTQ_QUESTION_CODE.investmentKotaykCities,
    other: MOOTQ_QUESTION_CODE.investmentKotaykOther,
  },
  tavush: {
    cities: MOOTQ_QUESTION_CODE.investmentTavushCities,
    other: MOOTQ_QUESTION_CODE.investmentTavushOther,
  },
};
