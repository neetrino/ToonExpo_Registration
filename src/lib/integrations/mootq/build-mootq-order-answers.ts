import { toMootqOptionLabel } from '@/lib/integrations/mootq/build-mootq-partner-answers';
import { MOOTQ_QUESTION } from '@/lib/integrations/mootq/mootq-order-ids';
import { isSpyurkFormVersion } from '@/lib/questionnaire/form-channel';
import {
  formatMarzSelectionLabel,
  formatResidenceMarzLabel,
} from '@/lib/questionnaire/marz-cities';
import { getSpyurkOptionLabel } from '@/lib/questionnaire/spyurk/i18n';
import type { SpyurkQuestionnaireAnswers } from '@/lib/questionnaire/spyurk/types';
import { spyurkQuestionnaireAnswersSchema } from '@/lib/questionnaire/spyurk/validate';
import type {
  MarketResearchAnswers,
  QuestionnaireAnswers,
  ResearchLocation,
  ResidencePlace,
} from '@/lib/questionnaire/types';
import { questionnaireAnswersSchema } from '@/lib/questionnaire/validate';

export type MootqOrderAnswerValue = string | string[];
export type MootqOrderPerUser = Record<string, MootqOrderAnswerValue>;

type OrderAnswerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  formVersion?: string | null;
  answers?: unknown;
};

/** Partner `answers.per_user`. Only question ids from the confirmed example are sent. */
export function buildMootqOrderPerUser(input: OrderAnswerInput): MootqOrderPerUser {
  const perUser: MootqOrderPerUser = {
    [MOOTQ_QUESTION.firstName]: input.firstName,
    [MOOTQ_QUESTION.lastName]: input.lastName,
    [MOOTQ_QUESTION.phone]: input.phone,
    [MOOTQ_QUESTION.email]: input.email,
  };
  assignNewsletter(perUser, input.answers);

  if (isSpyurkAnswers(input.formVersion, input.answers)) {
    const parsed = spyurkQuestionnaireAnswersSchema.safeParse(input.answers);
    if (parsed.success) {
      assignSpyurkAnswers(perUser, parsed.data);
    }
    return perUser;
  }

  const parsed = questionnaireAnswersSchema.safeParse(input.answers);
  if (parsed.success) {
    assignGeneralAnswers(perUser, parsed.data);
  }
  return perUser;
}

function assignNewsletter(perUser: MootqOrderPerUser, answers: unknown): void {
  if (!answers || typeof answers !== 'object' || !('newsletter' in answers)) {
    return;
  }
  const newsletter = answers.newsletter;
  if (typeof newsletter !== 'boolean') {
    return;
  }
  perUser[MOOTQ_QUESTION.newsletter] = toMootqOptionLabel('newsletter', newsletter ? 'yes' : 'no');
}

function assignGeneralAnswers(perUser: MootqOrderPerUser, answers: QuestionnaireAnswers): void {
  perUser[MOOTQ_QUESTION.ageBand] = toMootqOptionLabel('ageBand', answers.ageBand);
  perUser[MOOTQ_QUESTION.residenceScope] = toMootqOptionLabel(
    'locationSeekScope',
    answers.residence.scope,
  );
  perUser[MOOTQ_QUESTION.residenceDetail] = residenceDetail(answers.residence);
  perUser[MOOTQ_QUESTION.visitPurpose] = toMootqOptionLabel('visitPurpose', answers.visitPurpose);

  if (answers.visitPurpose === 'market_research') {
    assignMarketResearchAnswers(perUser, answers);
  }
}

function assignMarketResearchAnswers(
  perUser: MootqOrderPerUser,
  answers: MarketResearchAnswers,
): void {
  perUser[MOOTQ_QUESTION.marketInterests] = answers.marketInterests.map((code) =>
    toMootqOptionLabel('marketInterest', code),
  );
  perUser[MOOTQ_QUESTION.researchGoal] = toMootqOptionLabel('researchGoal', answers.researchGoal);
  perUser[MOOTQ_QUESTION.purchaseHorizon] = toMootqOptionLabel(
    'purchaseHorizon',
    answers.purchaseHorizon,
  );
  assignResearchLocation(perUser, answers.researchLocation);
}

function assignResearchLocation(perUser: MootqOrderPerUser, location: ResearchLocation): void {
  if (location.undecided) {
    perUser[MOOTQ_QUESTION.researchLocationScope] = toMootqOptionLabel(
      'locationSeekScope',
      'undecided',
    );
    return;
  }
  if (location.yerevanDistricts.length > 0) {
    perUser[MOOTQ_QUESTION.researchLocationScope] = toMootqOptionLabel(
      'locationSeekScope',
      'yerevan',
    );
    perUser[MOOTQ_QUESTION.researchLocationDetails] = location.yerevanDistricts.map((code) =>
      toMootqOptionLabel('yerevanDistrict', code),
    );
    return;
  }
  if (location.marzRegions.length > 0) {
    perUser[MOOTQ_QUESTION.researchLocationScope] = toMootqOptionLabel('locationSeekScope', 'marz');
    perUser[MOOTQ_QUESTION.researchLocationDetails] = location.marzRegions.map((code) =>
      formatMarzSelectionLabel(code, location.marzCities, marzLabelers()),
    );
    return;
  }
  if (location.abroadCountry) {
    perUser[MOOTQ_QUESTION.researchLocationScope] = toMootqOptionLabel(
      'locationSeekScope',
      'abroad',
    );
    perUser[MOOTQ_QUESTION.researchLocationDetails] = [location.abroadCountry];
  }
}

function assignSpyurkAnswers(
  perUser: MootqOrderPerUser,
  answers: SpyurkQuestionnaireAnswers,
): void {
  perUser[MOOTQ_QUESTION.ageBand] = toMootqOptionLabel('ageBand', answers.ageBand);
  perUser[MOOTQ_QUESTION.residenceScope] = toMootqOptionLabel('locationSeekScope', 'abroad');
  perUser[MOOTQ_QUESTION.residenceDetail] =
    `${answers.residence.city}, ${answers.residence.region}`;
  perUser[MOOTQ_QUESTION.visitPurpose] = toMootqOptionLabel('visitPurpose', answers.visitPurpose);

  if (answers.visitPurpose !== 'market_research') {
    return;
  }

  perUser[MOOTQ_QUESTION.marketInterests] = answers.marketInterests.map((code) =>
    toMootqOptionLabel('marketInterest', code),
  );
  perUser[MOOTQ_QUESTION.researchGoal] = getSpyurkOptionLabel(
    'researchGoal',
    answers.researchGoal,
    'hy',
  );
  perUser[MOOTQ_QUESTION.purchaseHorizon] = toMootqOptionLabel(
    'purchaseHorizon',
    answers.purchaseHorizon,
  );
}

function residenceDetail(residence: ResidencePlace): string {
  if (residence.scope === 'abroad') {
    return residence.country;
  }
  if (residence.scope === 'yerevan') {
    return toMootqOptionLabel('yerevanDistrict', residence.district);
  }
  return formatResidenceMarzLabel(
    residence.region,
    residence.city,
    residence.cityOther,
    marzLabelers(),
  );
}

function marzLabelers(): { region: (code: string) => string; city: (code: string) => string } {
  return {
    region: (code) => toMootqOptionLabel('marzRegion', code),
    city: (code) => toMootqOptionLabel('marzCity', code),
  };
}

function isSpyurkAnswers(formVersion: string | null | undefined, answers: unknown): boolean {
  if (isSpyurkFormVersion(formVersion)) {
    return true;
  }
  if (!answers || typeof answers !== 'object' || !('residence' in answers)) {
    return false;
  }
  const residence = answers.residence;
  if (!residence || typeof residence !== 'object') {
    return false;
  }
  const record = residence as Record<string, unknown>;
  return typeof record.city === 'string' && typeof record.scope !== 'string';
}
