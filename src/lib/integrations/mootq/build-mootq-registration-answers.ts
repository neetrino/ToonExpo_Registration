import {
  applyMootqRegistrationSchema,
  type MootqCodedAnswers,
} from '@/lib/integrations/mootq/apply-registration-schema';
import {
  buildMootqCodedAnswers,
  type BuildMootqCodedAnswersInput,
} from '@/lib/integrations/mootq/build-mootq-coded-answers';
import {
  MOOTQ_REQUIRE_ALL_ANSWERS,
  type MootqRegistrationSchema,
} from '@/lib/integrations/mootq/registration-schema';

/** Flat registration `answers`, keyed by the question codes of the supplied schema. */
export function buildMootqRegistrationAnswers(
  input: BuildMootqCodedAnswersInput,
  schema: MootqRegistrationSchema,
): MootqCodedAnswers {
  return applyMootqRegistrationSchema(
    schema,
    buildMootqCodedAnswers(input),
    MOOTQ_REQUIRE_ALL_ANSWERS,
  ).answers;
}
