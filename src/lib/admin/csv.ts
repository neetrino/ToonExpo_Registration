/**
 * Neutralize spreadsheet formula injection for CSV cell values.
 * Prefixes values whose first non-leading-space character is `=`, `+`, `-`, `@`, tab, or CR.
 */
export function neutralizeCsvValue(value: string): string {
  if (value.length === 0) {
    return value;
  }

  const withoutLeadingSpaces = value.replace(/^ +/, '');
  if (withoutLeadingSpaces.length === 0) {
    return value;
  }

  const first = withoutLeadingSpaces.charAt(0);
  if (
    first === '=' ||
    first === '+' ||
    first === '-' ||
    first === '@' ||
    first === '\t' ||
    first === '\r'
  ) {
    return `'${value}`;
  }

  return value;
}

/**
 * Escape a single CSV field (RFC 4180-style quoting) after formula neutralization.
 */
export function formatCsvCell(value: string): string {
  const neutralized = neutralizeCsvValue(value);
  const needsQuotes = /[",\n\r]/.test(neutralized);

  if (!needsQuotes) {
    return neutralized;
  }

  return `"${neutralized.replaceAll('"', '""')}"`;
}

export type CsvColumn = {
  key: string;
  header: string;
};

/**
 * Build a UTF-8 CSV document (Excel-friendly BOM) from column defs and row objects.
 * Column `header` is written in the first row; values are read from `row[key]`.
 */
export function buildCsv(
  columns: readonly CsvColumn[],
  rows: ReadonlyArray<Record<string, string>>,
): string {
  const lines: string[] = [columns.map((column) => formatCsvCell(column.header)).join(',')];

  for (const row of rows) {
    lines.push(columns.map((column) => formatCsvCell(row[column.key] ?? '')).join(','));
  }

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
