export type MootqVisibilityRule = {
  parentQuestionId: number;
  operator: string;
  expectedValue: string;
};

export type MootqSchemaQuestion = {
  id: number;
  code: string;
  type: number;
  options: string[];
  visibilityRules: MootqVisibilityRule[];
};

export type MootqRegistrationSchema = {
  perOrder: MootqSchemaQuestion[];
  perUser: MootqSchemaQuestion[];
  perTicket: MootqSchemaQuestion[];
};

export const MOOTQ_MULTI_SELECT_TYPE = 6;
export const MOOTQ_OTHER_OPTION = 'Այլ';

/** Parse the partner schema or the compact fixture. Returns null when the body is unusable. */
export function parseRegistrationSchema(value: unknown): MootqRegistrationSchema | null {
  if (!isRecord(value)) {
    return null;
  }

  const perUser = readQuestions(value.per_user ?? value.perUser);
  const perOrder = readQuestions(value.per_order ?? value.perOrder ?? []);
  const perTicket = readQuestions(value.per_ticket ?? value.perTicket ?? []);
  if (!perUser || !perOrder || !perTicket) {
    return null;
  }

  return { perUser, perOrder, perTicket };
}

function readQuestions(value: unknown): MootqSchemaQuestion[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const questions: MootqSchemaQuestion[] = [];
  for (const item of value) {
    const question = readQuestion(item);
    if (!question) {
      return null;
    }
    questions.push(question);
  }
  return questions;
}

function readQuestion(value: unknown): MootqSchemaQuestion | null {
  if (!isRecord(value) || typeof value.id !== 'number' || typeof value.code !== 'string') {
    return null;
  }
  if (typeof value.type !== 'number') {
    return null;
  }

  const options = readOptions(value.options);
  const visibilityRules = readRules(value.visibility_rules ?? value.visibilityRules);
  if (!options || !visibilityRules) {
    return null;
  }

  return { id: value.id, code: value.code, type: value.type, options, visibilityRules };
}

function readOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const options: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      options.push(item);
      continue;
    }
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
    const rule = readRule(item);
    if (!rule) {
      return null;
    }
    rules.push(rule);
  }
  return rules;
}

function readRule(value: unknown): MootqVisibilityRule | null {
  if (!isRecord(value) || typeof value.operator !== 'string') {
    return null;
  }

  const parentQuestionId = value.parent_question_id ?? value.parentQuestionId;
  const expectedValue = value.expected_value ?? value.expectedValue;
  if (typeof parentQuestionId !== 'number' || typeof expectedValue !== 'string') {
    return null;
  }

  return { parentQuestionId, operator: value.operator, expectedValue };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
