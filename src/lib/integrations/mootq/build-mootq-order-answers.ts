import { applyMootqRegistrationSchema } from '@/lib/integrations/mootq/apply-registration-schema';
import type { MootqCodedAnswer } from '@/lib/integrations/mootq/apply-registration-schema';
import {
  buildMootqCodedAnswers,
  type BuildMootqCodedAnswersInput,
} from '@/lib/integrations/mootq/build-mootq-coded-answers';
import type { MootqRegistrationSchema } from '@/lib/integrations/mootq/registration-schema';

export type MootqOrderAnswerValue = MootqCodedAnswer;
export type MootqOrderPerUser = Record<string, MootqOrderAnswerValue>;

/** Partner `answers.per_user`, keyed by the ids in the supplied schema. */
export function buildMootqOrderPerUser(
  input: BuildMootqCodedAnswersInput,
  schema: MootqRegistrationSchema,
): MootqOrderPerUser {
  return applyMootqRegistrationSchema(schema, buildMootqCodedAnswers(input)).per_user;
}
