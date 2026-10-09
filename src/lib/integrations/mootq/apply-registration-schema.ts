import {
  isMootqQuestionVisible,
  type MootqAnswerMap,
  type MootqAnswerValue,
} from '@/lib/integrations/mootq/evaluate-visibility';
import {
  isMootqArrayAnswerType,
  MOOTQ_OTHER_OPTION,
  type MootqRegistrationSchema,
  type MootqSchemaQuestion,
} from '@/lib/integrations/mootq/registration-schema';

export type MootqCodedAnswer = MootqAnswerValue;
export type MootqCodedAnswers = MootqAnswerMap;

export type MootqSchemaAnswersResult = {
  /** Flat `answers` body keyed by question code; hidden and blank answers removed. */
  answers: MootqCodedAnswers;
  /** Visible required questions left without a value. */
  missingRequired: string[];
};

/**
 * Fit coded answers to the current schema: exact option values, array vs scalar by type,
 * `max_selections`, conditional visibility. Unknown choices go to «Այլ» + its text child
 * when the question offers it; otherwise they are dropped.
 */
export function applyMootqRegistrationSchema(
  schema: MootqRegistrationSchema,
  coded: MootqCodedAnswers,
): MootqSchemaAnswersResult {
  const byCode = new Map(schema.questions.map((question) => [question.code, question]));
  const fitted = { ...coded };
  for (const question of schema.questions) {
    fitQuestionAnswer(question, schema.questions, fitted);
  }

  const answers: MootqCodedAnswers = {};
  const missingRequired: string[] = [];
  for (const question of schema.questions) {
    if (!isMootqQuestionVisible(question, byCode, fitted)) {
      continue;
    }
    const value = fitted[question.code];
    if (value !== undefined && hasAnswer(value)) {
      answers[question.code] = value;
    } else if (question.required) {
      missingRequired.push(question.code);
    }
  }
  return { answers, missingRequired };
}

function fitQuestionAnswer(
  question: MootqSchemaQuestion,
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
): void {
  const current = answers[question.code];
  if (current === undefined) {
    return;
  }
  const fitted =
    question.options.length > 0
      ? fitChoiceValue(question, questions, answers, current)
      : fitTextValue(current);
  if (fitted === undefined) {
    delete answers[question.code];
    return;
  }
  answers[question.code] = fitted;
}

function fitTextValue(current: MootqCodedAnswer): MootqCodedAnswer | undefined {
  const text = (Array.isArray(current) ? current.join(', ') : current).trim();
  return text.length > 0 ? text : undefined;
}

function fitChoiceValue(
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
  const unique = [...new Set(known)];
  if (unique.length === 0) {
    return undefined;
  }
  if (!isMootqArrayAnswerType(question.type)) {
    return unique[0];
  }
  return question.maxSelections ? unique.slice(0, question.maxSelections) : unique;
}

function assignOtherText(
  question: MootqSchemaQuestion,
  questions: readonly MootqSchemaQuestion[],
  answers: MootqCodedAnswers,
  text: string,
): void {
  const child = questions.find((item) =>
    item.visibilityRules.some(
      (rule) =>
        rule.parentQuestionCode === question.code && rule.expectedValue === MOOTQ_OTHER_OPTION,
    ),
  );
  if (!child || answers[child.code] !== undefined) {
    return;
  }
  answers[child.code] = text;
}

function hasAnswer(value: MootqCodedAnswer): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0);
  }
  return value.trim().length > 0;
}
