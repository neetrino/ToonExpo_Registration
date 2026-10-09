import {
  MOOTQ_MULTI_SELECT_TYPE,
  MOOTQ_OTHER_OPTION,
  type MootqRegistrationSchema,
  type MootqSchemaQuestion,
} from '@/lib/integrations/mootq/registration-schema';

export type MootqCodedAnswer = string | string[];
export type MootqCodedAnswers = Record<string, MootqCodedAnswer>;

export type MootqAnswerBuckets = {
  per_order: Record<string, MootqCodedAnswer>;
  per_user: Record<string, MootqCodedAnswer>;
  per_ticket: Record<string, MootqCodedAnswer>;
};

/**
 * Place coded answers onto the question ids from the current schema.
 * Hidden questions are omitted. Select values that are not in `options` are dropped,
 * or moved to the «Այլ» follow-up when that option exists.
 */
export function applyMootqRegistrationSchema(
  schema: MootqRegistrationSchema,
  coded: MootqCodedAnswers,
): MootqAnswerBuckets {
  const answers = { ...coded };
  const questions = allQuestions(schema);
  fitSelectAnswers(questions, answers);

  return {
    per_order: placeGroup(schema.perOrder, questions, answers),
    per_user: placeGroup(schema.perUser, questions, answers),
    per_ticket: placeGroup(schema.perTicket, questions, answers),
  };
}

function fitSelectAnswers(
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
): void {
  for (const question of questions) {
    const current = answers[question.code];
    if (current === undefined || question.options.length === 0) {
      continue;
    }
    const fitted = fitSelectValue(question, questions, answers, current);
    if (fitted === undefined) {
      delete answers[question.code];
      continue;
    }
    answers[question.code] = fitted;
  }
}

function fitSelectValue(
  question: MootqSchemaQuestion,
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
  current: MootqCodedAnswer,
): MootqCodedAnswer | undefined {
  const list = Array.isArray(current) ? current : [current];
  const known = list.filter((item) => question.options.includes(item));
  const unknown = list.filter((item) => item.trim() && !question.options.includes(item));
  if (unknown.length > 0 && question.options.includes(MOOTQ_OTHER_OPTION)) {
    known.push(MOOTQ_OTHER_OPTION);
    assignOtherText(question, questions, answers, unknown.join(', '));
  }
  if (known.length === 0) {
    return undefined;
  }
  return question.type === MOOTQ_MULTI_SELECT_TYPE ? known : known[0];
}

function assignOtherText(
  question: MootqSchemaQuestion,
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
  text: string,
): void {
  const child = questions.find((item) =>
    item.visibilityRules.some(
      (rule) => rule.parentQuestionId === question.id && rule.expectedValue === MOOTQ_OTHER_OPTION,
    ),
  );
  if (!child || answers[child.code] !== undefined) {
    return;
  }
  answers[child.code] = text;
}

function placeGroup(
  group: readonly MootqSchemaQuestion[],
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
): Record<string, MootqCodedAnswer> {
  const placed: Record<string, MootqCodedAnswer> = {};
  for (const question of group) {
    if (!isQuestionVisible(question, questions, answers)) {
      continue;
    }
    const value = answers[question.code];
    if (!hasAnswer(value)) {
      continue;
    }
    placed[String(question.id)] = value;
  }
  return placed;
}

function isQuestionVisible(
  question: MootqSchemaQuestion,
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
): boolean {
  return question.visibilityRules.every((rule) => {
    if (rule.operator !== 'eq') {
      return false;
    }
    const parent = questions.find((item) => item.id === rule.parentQuestionId);
    if (!parent) {
      return false;
    }
    return answerEquals(answers[parent.code], rule.expectedValue);
  });
}

function answerEquals(value: MootqCodedAnswer | undefined, expected: string): boolean {
  if (Array.isArray(value)) {
    return value.includes(expected);
  }
  return value === expected;
}

function hasAnswer(value: MootqCodedAnswer | undefined): value is MootqCodedAnswer {
  if (value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0);
  }
  return value.trim().length > 0;
}

function allQuestions(schema: MootqRegistrationSchema): MootqSchemaQuestion[] {
  return [...schema.perOrder, ...schema.perUser, ...schema.perTicket];
}
