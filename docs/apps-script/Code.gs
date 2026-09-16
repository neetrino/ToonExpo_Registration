/**
 * ToonExpo Registration — Apps Script webhook for Google Sheets.
 *
 * Setup:
 * 1. Open your registrations spreadsheet.
 * 2. Create two sheets named exactly: General | Spyurk RF (header row optional).
 * 3. Extensions → Apps Script → paste this file.
 * 4. Set WEBHOOK_SECRET to the same value as SHEETS_WEBHOOK_SECRET in Vercel / .env.
 * 5. Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the /exec URL into SHEETS_WEBHOOK_URL (env only, never git).
 *
 * Neon remains the source of truth. This webhook only appends a human-readable copy.
 */

const WEBHOOK_SECRET = 'REPLACE_WITH_SHEETS_WEBHOOK_SECRET';

const DEFAULT_TABS = {
  GENERAL: 'General',
  SPYURK_RF: 'Spyurk RF',
};

const MAX_VALUES = 80;
const MAX_CELL_CHARS = 500;

function doPost(event) {
  try {
    if (!event || !event.postData || !event.postData.contents) {
      return jsonResponse({ error: 'empty' });
    }

    const payload = JSON.parse(event.postData.contents);
    if (!payload.secret || payload.secret !== WEBHOOK_SECRET) {
      return jsonResponse({ error: 'unauthorized' });
    }

    const channel = payload.channel;
    const values = payload.values;
    if ((channel !== 'GENERAL' && channel !== 'SPYURK_RF') || !Array.isArray(values)) {
      return jsonResponse({ error: 'invalid' });
    }
    if (values.length === 0 || values.length > MAX_VALUES) {
      return jsonResponse({ error: 'invalid' });
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = resolveSheet(spreadsheet, channel, payload.tab);
    if (!sheet) {
      return jsonResponse({ error: 'sheet_missing' });
    }

    ensureHeaders(sheet, payload.headers);
    sheet.appendRow(values.map(sanitizeCell));
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ error: 'failed' });
  }
}

function resolveSheet(spreadsheet, channel, requestedName) {
  if (typeof requestedName === 'string' && requestedName) {
    const named = spreadsheet.getSheetByName(requestedName);
    if (named) {
      return named;
    }
  }

  const fallbackName = DEFAULT_TABS[channel];
  if (!fallbackName) {
    return null;
  }

  const fallback = spreadsheet.getSheetByName(fallbackName);
  if (fallback) {
    return fallback;
  }

  return spreadsheet.insertSheet(fallbackName);
}

function ensureHeaders(sheet, headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return;
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const same = headers.every(function (header, index) {
    return String(firstRow[index] || '') === String(header);
  });
  if (same) {
    return;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function sanitizeCell(value) {
  const text = String(value == null ? '' : value).slice(0, MAX_CELL_CHARS);
  if (/^[=+\-@\t\r]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
