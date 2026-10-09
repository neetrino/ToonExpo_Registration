import type {
  MootqRuleScalar,
  MootqRuleValue,
  MootqSchemaQuestion,
  MootqVisibilityRule,
} from '@/lib/integrations/mootq/registration-schema';

export type MootqAnswerValue = string | string[];
export type MootqAnswerMap = Record<string, MootqAnswerValue>;

/**
 * Visible when every rule matches and every parent is itself visible.
 * Unknown operators, missing parents, and dependency cycles mean hidden.
 */
export function isMootqQuestionVisible(
  question: MootqSchemaQuestion,
  questionsByCode: ReadonlyMap<string, MootqSchemaQuestion>,
  answers: MootqAnswerMap,
  visiting: ReadonlySet<string> = new Set(),
): boolean {
  if (visiting.has(question.code)) {
    return false;
  }
  const path = new Set(visiting).add(question.code);
  return question.visibilityRules.every((rule) => {
    const parent = rule.parentQuestionCode ? questionsByCode.get(rule.parentQuestionCode) : undefined;
    if (!parent || !isMootqQuestionVisible(parent, questionsByCode, answers, path)) {
      return false;
    }
    return matchesRule(rule, answers[parent.code]);
  });
}

function matchesRule(rule: MootqVisibilityRule, answer: MootqAnswerValue | undefined): boolean {
  const expected = rule.expectedValue;
  switch (rule.operator) {
    case 'eq':
      return equalsExpected(answer, expected);
    case 'neq':
      return !equalsExpected(answer, expected);
    case 'in':
      return isInExpected(answer, expected);
    case 'not_in':
      return !isInExpected(answer, expected);
    case 'contains':
      return containsExpected(answer, expected);
    case 'exists':
      return answer !== undefined;
    case 'not_exists':
      return answer === undefined;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return compareNumbers(rule.operator, answer, expected);
    default:
      return false;
  }
}

/** A choice-list parent matches a scalar `eq` when it includes that value, as Mootq's form does. */
function equalsExpected(answer: MootqAnswerValue | undefined, expected: MootqRuleValue): boolean {
  if (answer === undefined) {
    return expected === null;
  }
  if (Array.isArray(expected)) {
    return (
      Array.isArray(answer) &&
      answer.length === expected.length &&
      answer.every((item, index) => scalarEquals(item, expected[index] ?? null))
    );
  }
  if (Array.isArray(answer)) {
    return answer.some((item) => scalarEquals(item, expected));
  }
  return scalarEquals(answer, expected);
}

function isInExpected(answer: MootqAnswerValue | undefined, expected: MootqRuleValue): boolean {
  if (answer === undefined || !Array.isArray(expected)) {
    return false;
  }
  const values = Array.isArray(answer) ? answer : [answer];
  return values.some((item) => expected.some((member) => scalarEquals(item, member)));
}

function containsExpected(answer: MootqAnswerValue | undefined, expected: MootqRuleValue): boolean {
  if (answer === undefined) {
    return false;
  }
  if (typeof answer === 'string') {
    return typeof expected === 'string' && answer.includes(expected);
  }
  const wanted = Array.isArray(expected) ? expected : [expected];
  return answer.some((item) => wanted.some((member) => scalarEquals(item, member)));
}

function compareNumbers(
  operator: 'gt' | 'gte' | 'lt' | 'lte',
  answer: MootqAnswerValue | undefined,
  expected: MootqRuleValue,
): boolean {
  const left = typeof answer === 'string' ? toNumber(answer) : null;
  const right = typeof expected === 'string' || typeof expected === 'number' ? toNumber(expected) : null;
  if (left === null || right === null) {
    return false;
  }
  if (operator === 'gt') return left > right;
  if (operator === 'gte') return left >= right;
  if (operator === 'lt') return left < right;
  return left <= right;
}

function scalarEquals(answer: string, expected: MootqRuleScalar): boolean {
  if (expected === null || typeof expected === 'boolean') {
    return false;
  }
  if (typeof expected === 'number') {
    return toNumber(answer) === expected;
  }
  return answer.trim() === expected.trim();
}

function toNumber(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
