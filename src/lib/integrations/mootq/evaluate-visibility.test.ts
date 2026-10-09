import { describe, expect, it } from 'vitest';
import {
  isMootqQuestionVisible,
  type MootqAnswerMap,
} from '@/lib/integrations/mootq/evaluate-visibility';
import type {
  MootqRuleValue,
  MootqSchemaQuestion,
} from '@/lib/integrations/mootq/registration-schema';

function question(
  code: string,
  rules: Array<{ parent: string | null; operator: string; expected: MootqRuleValue }> = [],
): MootqSchemaQuestion {
  return {
    code,
    type: 1,
    required: true,
    options: [],
    maxSelections: null,
    visibilityRules: rules.map((rule) => ({
      parentQuestionCode: rule.parent,
      operator: rule.operator,
      expectedValue: rule.expected,
    })),
  };
}

function visible(
  child: MootqSchemaQuestion,
  answers: MootqAnswerMap,
  extra: MootqSchemaQuestion[] = [],
): boolean {
  const all = [question('parent'), child, ...extra];
  const byCode = new Map(all.map((item) => [item.code, item]));
  return isMootqQuestionVisible(child, byCode, answers);
}

const rule = (operator: string, expected: MootqRuleValue) => [
  { parent: 'parent', operator, expected },
];

describe('isMootqQuestionVisible', () => {
  it('shows questions without rules', () => {
    expect(visible(question('child'), {})).toBe(true);
  });

  it('evaluates eq/neq on scalars and choice lists', () => {
    expect(visible(question('child', rule('eq', 'other')), { parent: 'other' })).toBe(true);
    expect(visible(question('child', rule('eq', 'other')), { parent: 'buy' })).toBe(false);
    expect(visible(question('child', rule('eq', 'other')), { parent: ['buy', 'other'] })).toBe(
      true,
    );
    expect(visible(question('child', rule('eq', ['a', 'b'])), { parent: ['a', 'b'] })).toBe(true);
    expect(visible(question('child', rule('eq', ['a', 'b'])), { parent: ['b', 'a'] })).toBe(false);
    expect(visible(question('child', rule('neq', 'other')), { parent: 'buy' })).toBe(true);
  });

  it('evaluates in / not_in / contains', () => {
    expect(visible(question('child', rule('in', ['a', 'b'])), { parent: 'b' })).toBe(true);
    expect(visible(question('child', rule('in', ['a', 'b'])), { parent: ['c', 'a'] })).toBe(true);
    expect(visible(question('child', rule('not_in', ['a'])), { parent: 'b' })).toBe(true);
    expect(visible(question('child', rule('contains', 'x')), { parent: ['x', 'y'] })).toBe(true);
    expect(visible(question('child', rule('contains', 'ell')), { parent: 'hello' })).toBe(true);
  });

  it('evaluates exists / not_exists and numeric comparisons', () => {
    expect(visible(question('child', rule('exists', null)), { parent: 'a' })).toBe(true);
    expect(visible(question('child', rule('exists', null)), {})).toBe(false);
    expect(visible(question('child', rule('not_exists', null)), {})).toBe(true);
    expect(visible(question('child', rule('gte', 18)), { parent: '18' })).toBe(true);
    expect(visible(question('child', rule('lt', 18)), { parent: '18' })).toBe(false);
    expect(visible(question('child', rule('gt', 1)), { parent: 'abc' })).toBe(false);
  });

  it('requires every rule (AND)', () => {
    const child = question('child', [
      { parent: 'parent', operator: 'eq', expected: 'a' },
      { parent: 'second', operator: 'eq', expected: 'b' },
    ]);
    expect(visible(child, { parent: 'a', second: 'b' }, [question('second')])).toBe(true);
    expect(visible(child, { parent: 'a', second: 'x' }, [question('second')])).toBe(false);
  });

  it('hides on unknown operators, missing parents, hidden parents, and cycles', () => {
    expect(visible(question('child', rule('matches', 'a')), { parent: 'a' })).toBe(false);
    expect(visible(question('child', [{ parent: null, operator: 'exists', expected: null }]), {}))
      .toBe(false);
    expect(
      visible(question('child', [{ parent: 'ghost', operator: 'eq', expected: 'a' }]), {}),
    ).toBe(false);

    const hiddenParent = question('middle', rule('eq', 'yes'));
    const grandchild = question('child', [{ parent: 'middle', operator: 'eq', expected: 'x' }]);
    expect(visible(grandchild, { parent: 'no', middle: 'x' }, [hiddenParent])).toBe(false);
    expect(visible(grandchild, { parent: 'yes', middle: 'x' }, [hiddenParent])).toBe(true);

    const loopA = question('child', [{ parent: 'loop', operator: 'exists', expected: null }]);
    const loopB = question('loop', [{ parent: 'child', operator: 'exists', expected: null }]);
    expect(visible(loopA, { child: 'a', loop: 'b' }, [loopB])).toBe(false);
  });
});
