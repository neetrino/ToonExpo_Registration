export type MootqRuleScalar = string | number | boolean | null;
export type MootqRuleValue = MootqRuleScalar | MootqRuleScalar[];

export type MootqVisibilityRule = {
  parentQuestionCode: string | null;
  operator: string;
  expectedValue: MootqRuleValue;
};

export type MootqSchemaQuestion = {
  code: string;
  type: number;
  required: boolean;
  options: string[];
  maxSelections: number | null;
  visibilityRules: MootqVisibilityRule[];
};

/** Partner registration schema (`GET /api/v1/integrations/events/{eventKey}/registration-schema`). */
export type MootqRegistrationSchema = {
  eventKey: string;
  identityAnswerCodes: Partial<Record<MootqIdentityField, string>>;
  questions: MootqSchemaQuestion[];
};

export type MootqIdentityField = 'firstName' | 'lastName' | 'email' | 'phone';

const MOOTQ_IDENTITY_FIELDS: readonly MootqIdentityField[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
];

/** MULTISELECT (5) and CHECKBOX (6) take an array of option values. */
const MOOTQ_ARRAY_ANSWER_TYPES: ReadonlySet<number> = new Set([5, 6]);
export const MOOTQ_OTHER_OPTION = 'Այլ';

export function isMootqArrayAnswerType(type: number): boolean {
  return MOOTQ_ARRAY_ANSWER_TYPES.has(type);
}

/** Parse the `200` body (or its `data` object). Returns null when the body is unusable. */
export function parseRegistrationSchema(value: unknown): MootqRegistrationSchema | null {
  const data = isRecord(value) && isRecord(value.data) ? value.data : value;
  if (!isRecord(data) || typeof data.eventKey !== 'string' || !Array.isArray(data.questions)) {
    return null;
  }

  const questions: MootqSchemaQuestion[] = [];
  for (const item of data.questions) {
    const question = readQuestion(item);
    if (!question) {
      return null;
    }
    questions.push(question);
  }

  const submission = isRecord(data.submission) ? data.submission : {};
  return {
    eventKey: data.eventKey,
    identityAnswerCodes: readIdentityCodes(submission.identityAnswerCodes),
    questions,
  };
}

function readQuestion(value: unknown): MootqSchemaQuestion | null {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.type !== 'number') {
    return null;
  }

  const options = readOptions(value.options);
  const visibilityRules = readRules(value.visibility_rules);
  if (!options || !visibilityRules) {
    return null;
  }

  return {
    code: value.code,
    type: value.type,
    required: value.required === true,
    options,
    maxSelections: readMaxSelections(value.config),
    visibilityRules,
  };
}

function readOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const options: string[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.value !== 'string') {
      return null;
    }
    options.push(item.value);
  }
  return options;
}

function readRules(value: unknown): MootqVisibilityRule[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const rules: MootqVisibilityRule[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.operator !== 'string' || !isRuleValue(item.expected_value)) {
      return null;
    }
    const parent = item.parent_question_code;
    rules.push({
      parentQuestionCode: typeof parent === 'string' ? parent : null,
      operator: item.operator,
      expectedValue: item.expected_value,
    });
  }
  return rules;
}

function readMaxSelections(config: unknown): number | null {
  if (!isRecord(config)) {
    return null;
  }
  const max = config.max_selections;
  return typeof max === 'number' && Number.isInteger(max) && max >= 1 ? max : null;
}

function readIdentityCodes(value: unknown): Partial<Record<MootqIdentityField, string>> {
  const codes: Partial<Record<MootqIdentityField, string>> = {};
  if (!isRecord(value)) {
    return codes;
  }
  for (const field of MOOTQ_IDENTITY_FIELDS) {
    const code = value[field];
    if (typeof code === 'string' && code.length > 0) {
      codes[field] = code;
    }
  }
  return codes;
}

function isRuleValue(value: unknown): value is MootqRuleValue {
  if (value === undefined) {
    return false;
  }
  return Array.isArray(value) ? value.every(isRuleScalar) : isRuleScalar(value);
}

function isRuleScalar(value: unknown): value is MootqRuleScalar {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
