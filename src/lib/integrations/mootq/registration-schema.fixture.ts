import fixtureJson from '@/lib/integrations/mootq/registration-schema.fixture.json';
import { MOOTQ_QUESTION_CODE } from '@/lib/integrations/mootq/mootq-question-codes';
import {
  parseRegistrationSchema,
  type MootqRegistrationSchema,
} from '@/lib/integrations/mootq/registration-schema';

const parsed = parseRegistrationSchema(fixtureJson);
if (!parsed) {
  throw new Error('Mootq registration schema fixture is invalid');
}

export const mootqSchemaFixture: MootqRegistrationSchema = parsed;

function questionId(code: string): string {
  const question = mootqSchemaFixture.perUser.find((item) => item.code === code);
  if (!question) {
    throw new Error(`Missing schema question ${code}`);
  }
  return String(question.id);
}

export const Q = {
  firstName: questionId(MOOTQ_QUESTION_CODE.firstName),
  lastName: questionId(MOOTQ_QUESTION_CODE.lastName),
  phone: questionId(MOOTQ_QUESTION_CODE.phone),
  email: questionId(MOOTQ_QUESTION_CODE.email),
  ageBand: questionId(MOOTQ_QUESTION_CODE.ageBand),
  residenceScope: questionId(MOOTQ_QUESTION_CODE.residenceScope),
  residenceYerevan: questionId(MOOTQ_QUESTION_CODE.residenceYerevan),
  residenceMarz: questionId(MOOTQ_QUESTION_CODE.residenceMarz),
  residenceAbroad: questionId(MOOTQ_QUESTION_CODE.residenceAbroad),
  visitPurpose: questionId(MOOTQ_QUESTION_CODE.visitPurpose),
  interestType: questionId(MOOTQ_QUESTION_CODE.interestType),
  ownYerevan: questionId(MOOTQ_QUESTION_CODE.ownYerevan),
  investmentPropertyType: questionId(MOOTQ_QUESTION_CODE.investmentPropertyType),
  investmentKotaykCities: questionId(MOOTQ_QUESTION_CODE.investmentKotaykCities),
  newsletter: questionId(MOOTQ_QUESTION_CODE.newsletter),
  marketInterests: questionId(MOOTQ_QUESTION_CODE.marketInterests),
  researchGoal: questionId(MOOTQ_QUESTION_CODE.researchGoal),
  researchLocationScope: questionId(MOOTQ_QUESTION_CODE.researchLocationScope),
  researchYerevan: questionId(MOOTQ_QUESTION_CODE.researchYerevan),
  researchMarz: questionId(MOOTQ_QUESTION_CODE.researchMarz),
  researchAbroad: questionId(MOOTQ_QUESTION_CODE.researchAbroad),
  purchaseHorizon: questionId(MOOTQ_QUESTION_CODE.purchaseHorizon),
} as const;
