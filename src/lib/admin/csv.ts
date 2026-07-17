/**
 * Neutralize spreadsheet formula injection for CSV cell values.
 * Prefixes values that start with `=`, `+`, `-`, `@`, tab, or CR.
 */
export function neutralizeCsvValue(value: string): string {
  if (value.length === 0) {
    return value;
  }

  const first = value.charAt(0);
  if (first === '=' || first === '+' || first === '-' || first === '@' || first === '\t' || first === '\r') {
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

/**
 * Build a UTF-8 CSV document from allowlisted headers and row objects.
 */
export function buildCsv(headers: readonly string[], rows: ReadonlyArray<Record<string, string>>): string {
  const lines: string[] = [headers.map(formatCsvCell).join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => formatCsvCell(row[header] ?? '')).join(','));
  }

  return `${lines.join('\r\n')}\r\n`;
}
