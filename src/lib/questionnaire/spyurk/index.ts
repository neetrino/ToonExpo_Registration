export {
  SPYURK_DEFAULT_PHONE_COUNTRY,
  SPYURK_FORM_VERSION,
  SPYURK_MULTI_SELECT_MAX,
  SPYURK_RESIDENCE_TEXT_MAX_LENGTH,
  type SpyurkFormVersion,
} from '@/lib/questionnaire/spyurk/constants';
export {
  getSpyurkOptionLabel,
  getSpyurkQuestionLabel,
  spyurkQuestionnaireI18n,
} from '@/lib/questionnaire/spyurk/i18n';
export * from '@/lib/questionnaire/spyurk/options';
export type * from '@/lib/questionnaire/spyurk/types';
export {
  spyurkInvestmentAnswersSchema,
  spyurkMarketResearchAnswersSchema,
  spyurkOwnResidenceAnswersSchema,
  spyurkQuestionnaireAnswersSchema,
  type ParsedSpyurkQuestionnaireAnswers,
} from '@/lib/questionnaire/spyurk/validate';
