import { describe, expect, it } from 'vitest';
import { buildCsv, formatCsvCell, neutralizeCsvValue } from '@/lib/admin/csv';

describe('neutralizeCsvValue', () => {
  it('prefixes formula-like leading characters', () => {
    expect(neutralizeCsvValue('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(neutralizeCsvValue('+1234')).toBe("'+1234");
    expect(neutralizeCsvValue('-1')).toBe("'-1");
    expect(neutralizeCsvValue('@cmd')).toBe("'@cmd");
    expect(neutralizeCsvValue('\tTAB')).toBe("'\tTAB");
    expect(neutralizeCsvValue('\rCR')).toBe("'\rCR");
  });

  it('leaves ordinary values unchanged', () => {
    expect(neutralizeCsvValue('Ada Lovelace')).toBe('Ada Lovelace');
    expect(neutralizeCsvValue('user@example.com')).toBe('user@example.com');
    expect(neutralizeCsvValue('')).toBe('');
  });
});

describe('formatCsvCell', () => {
  it('quotes fields that contain commas or quotes', () => {
    expect(formatCsvCell('a,b')).toBe('"a,b"');
    expect(formatCsvCell('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('buildCsv', () => {
  it('builds a formula-safe document with headers', () => {
    const csv = buildCsv(['name', 'note'], [{ name: 'Ann', note: '=1+1' }]);
    expect(csv).toBe("name,note\r\nAnn,'=1+1\r\n");
  });
});
