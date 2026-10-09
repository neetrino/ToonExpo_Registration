import fixtureJson from '@/lib/integrations/mootq/registration-schema.fixture.json';
import { MOOTQ_QUESTION_CODE } from '@/lib/integrations/mootq/mootq-question-codes';
import {
  parseRegistrationSchema,
  type MootqRegistrationSchema,
  type MootqSchemaQuestion,
} from '@/lib/integrations/mootq/registration-schema';

const parsed = parseRegistrationSchema(fixtureJson);
if (!parsed) {
  throw new Error('Mootq registration schema fixture is invalid');
}

/** Compact snapshot of the live partner schema for `toon-expo-2026`. */
export const mootqSchemaFixture: MootqRegistrationSchema = parsed;

export function fixtureQuestion(code: string): MootqSchemaQuestion {
  const question = mootqSchemaFixture.questions.find((item) => item.code === code);
  if (!question) {
    throw new Error(`Missing schema question ${code}`);
  }
  return question;
}

function questionCode(code: string): string {
  return fixtureQuestion(code).code;
}

export const Q = {
  firstName: questionCode(MOOTQ_QUESTION_CODE.firstName),
  lastName: questionCode(MOOTQ_QUESTION_CODE.lastName),
  phone: questionCode(MOOTQ_QUESTION_CODE.phone),
  email: questionCode(MOOTQ_QUESTION_CODE.email),
  ageBand: questionCode(MOOTQ_QUESTION_CODE.ageBand),
  residenceScope: questionCode(MOOTQ_QUESTION_CODE.residenceScope),
  residenceYerevan: questionCode(MOOTQ_QUESTION_CODE.residenceYerevan),
  residenceMarz: questionCode(MOOTQ_QUESTION_CODE.residenceMarz),
  residenceAbroad: questionCode(MOOTQ_QUESTION_CODE.residenceAbroad),
  visitPurpose: questionCode(MOOTQ_QUESTION_CODE.visitPurpose),
  interestType: questionCode(MOOTQ_QUESTION_CODE.interestType),
  ownYerevan: questionCode(MOOTQ_QUESTION_CODE.ownYerevan),
  investmentPropertyType: questionCode(MOOTQ_QUESTION_CODE.investmentPropertyType),
  investmentKotaykCities: questionCode(MOOTQ_QUESTION_CODE.investmentKotaykCities),
  newsletter: questionCode(MOOTQ_QUESTION_CODE.newsletter),
  marketInterests: questionCode(MOOTQ_QUESTION_CODE.marketInterests),
  researchGoal: questionCode(MOOTQ_QUESTION_CODE.researchGoal),
  researchLocationScope: questionCode(MOOTQ_QUESTION_CODE.researchLocationScope),
  researchYerevan: questionCode(MOOTQ_QUESTION_CODE.researchYerevan),
  researchMarz: questionCode(MOOTQ_QUESTION_CODE.researchMarz),
  researchAbroad: questionCode(MOOTQ_QUESTION_CODE.researchAbroad),
  purchaseHorizon: questionCode(MOOTQ_QUESTION_CODE.purchaseHorizon),
} as const;
