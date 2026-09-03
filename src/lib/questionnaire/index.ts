export {
  FORM_VERSION,
  LOCATION_CHOICE_MAX,
  MARKET_INTERESTS_MAX,
  OTHER_TEXT_MAX_LENGTH,
  type FormVersion,
} from '@/lib/questionnaire/constants';
export {
  countLocationChoiceLeaves,
  locationChoiceSchema,
  researchLocationSchema,
  residencePlaceSchema,
} from '@/lib/questionnaire/location-choice';
export { QUESTIONNAIRE_DEFINITION } from '@/lib/questionnaire/definition';
export {
  getQuestionnaireLabel,
  questionnaireI18n,
  type QuestionnaireLocale,
} from '@/lib/questionnaire/i18n';
export * from '@/lib/questionnaire/options';
export type * from '@/lib/questionnaire/types';
export {
  investmentAnswersSchema,
  marketResearchAnswersSchema,
  ownResidenceAnswersSchema,
  questionnaireAnswersSchema,
  type ParsedQuestionnaireAnswers,
} from '@/lib/questionnaire/validate';
