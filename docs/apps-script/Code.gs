/**
 * ToonExpo Registration — Apps Script webhook for Google Sheets.
 *
 * Setup:
 * 1. Open your registrations spreadsheet.
 * 2. Tabs are created automatically: Ընդհանուր | Սփյուռք ՌԴ
 * 3. Extensions → Apps Script → paste this file.
 * 4. Set WEBHOOK_SECRET to the same value as SHEETS_WEBHOOK_SECRET in Vercel / .env.
 * 5. Deploy → Manage deployments → Edit → New version (after each code change).
 *
 * One-time cleanup (no deploy needed):
 * select wipeAndSeedDemo → Run → allow permissions.
 */

const WEBHOOK_SECRET = 'REPLACE_WITH_SHEETS_WEBHOOK_SECRET';

const DEFAULT_TABS = {
  GENERAL: 'Ընդհանուր',
  SPYURK_RF: 'Սփյուռք ՌԴ',
};

const LEGACY_TABS = {
  GENERAL: 'General',
  SPYURK_RF: 'Spyurk RF',
};

const MAX_VALUES = 80;
const MAX_CELL_CHARS = 500;
const HEADER_BG = '#00303D';
const HEADER_FG = '#FFFFFF';
const MIN_COL_WIDTH = 120;
const MAX_COL_WIDTH = 220;

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
    if (channel !== 'GENERAL' && channel !== 'SPYURK_RF') {
      return jsonResponse({ error: 'invalid' });
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = resolveSheet(spreadsheet, channel, payload.tab);
    if (!sheet) {
      return jsonResponse({ error: 'sheet_missing' });
    }

    if (payload.action === 'reset') {
      return resetSheet(sheet, payload.headers, payload.rows);
    }

    if (payload.action === 'deleteByRegistrationId') {
      return deleteRowsByRegistrationId(sheet, payload.registrationId);
    }

    const values = payload.values;
    if (!Array.isArray(values) || values.length === 0 || values.length > MAX_VALUES) {
      return jsonResponse({ error: 'invalid' });
    }

    const headerCount = Array.isArray(payload.headers) ? payload.headers.length : values.length;
    ensureHeaders(sheet, payload.headers);
    sheet.appendRow(values.map(sanitizeCell));
    beautifyLastRow(sheet, headerCount);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ error: 'failed' });
  }
}

/**
 * Run once from the Apps Script editor to wipe junk and seed readable demo rows.
 * Menu: select wipeAndSeedDemo → Run.
 */
function wipeAndSeedDemo() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = resolveSheet(spreadsheet, 'GENERAL', DEFAULT_TABS.GENERAL);
  if (!sheet) {
    throw new Error('sheet_missing');
  }

  const headers = demoGeneralHeaders_();
  const rows = demoGeneralRows_();
  resetSheet(sheet, headers, rows);
}

function resetSheet(sheet, headers, rows) {
  if (!Array.isArray(headers) || headers.length === 0 || headers.length > MAX_VALUES) {
    return jsonResponse({ error: 'invalid' });
  }

  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }
  sheet.clear();

  const lastCol = sheet.getMaxColumns();
  if (lastCol > headers.length) {
    try {
      sheet.deleteColumns(headers.length + 1, lastCol - headers.length);
    } catch (error) {
      // ignore
    }
  }

  var dataRows = [];
  if (Array.isArray(rows)) {
    for (var i = 0; i < rows.length; i++) {
      if (!Array.isArray(rows[i]) || rows[i].length === 0) {
        continue;
      }
      dataRows.push(rows[i].map(sanitizeCell));
    }
  }

  var table = [headers].concat(dataRows);
  sheet.getRange(1, 1, table.length, headers.length).setValues(table);
  formatHeader(sheet, headers.length);

  if (dataRows.length > 0) {
    sheet
      .getRange(2, 1, dataRows.length, headers.length)
      .setWrap(true)
      .setVerticalAlignment('top');
  }

  return jsonResponse({ ok: true });
}

function resolveSheet(spreadsheet, channel, requestedName) {
  if (typeof requestedName === 'string' && requestedName) {
    const named = spreadsheet.getSheetByName(requestedName);
    if (named) {
      return named;
    }
  }

  const preferred = DEFAULT_TABS[channel];
  const preferredSheet = preferred ? spreadsheet.getSheetByName(preferred) : null;
  if (preferredSheet) {
    return preferredSheet;
  }

  const legacyName = LEGACY_TABS[channel];
  const legacy = legacyName ? spreadsheet.getSheetByName(legacyName) : null;
  if (legacy && preferred && legacy.getName() !== preferred) {
    legacy.setName(preferred);
    return legacy;
  }
  if (legacy) {
    return legacy;
  }

  return preferred ? spreadsheet.insertSheet(preferred) : null;
}

function ensureHeaders(sheet, headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return;
  }

  const lastCol = Math.max(sheet.getLastColumn(), headers.length);
  const firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const samePrefix = headers.every(function (header, index) {
    return String(firstRow[index] || '') === String(header);
  });
  var hasExtraHeaders = false;
  for (var i = headers.length; i < firstRow.length; i++) {
    if (String(firstRow[i] || '') !== '') {
      hasExtraHeaders = true;
      break;
    }
  }

  if (samePrefix && !hasExtraHeaders) {
    return;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  trimExtraColumns(sheet, headers.length);
  formatHeader(sheet, headers.length);
}

function trimExtraColumns(sheet, keepCount) {
  var lastCol = sheet.getLastColumn();
  if (lastCol <= keepCount) {
    return;
  }

  sheet.getRange(1, keepCount + 1, Math.max(sheet.getLastRow(), 1), lastCol).clear();
  try {
    sheet.deleteColumns(keepCount + 1, lastCol - keepCount);
  } catch (error) {
    // ignore
  }
}

function formatHeader(sheet, columnCount) {
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange.setFontWeight('bold');
  headerRange.setBackground(HEADER_BG);
  headerRange.setFontColor(HEADER_FG);
  headerRange.setWrap(true);
  headerRange.setVerticalAlignment('middle');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.setRowHeight(1, 40);

  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), columnCount).createFilter();

  // Fixed widths — much faster than autoResize on wide sheets.
  for (var col = 1; col <= columnCount; col++) {
    sheet.setColumnWidth(col, MIN_COL_WIDTH + 20);
  }
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 140);
}

function beautifyLastRow(sheet, columnCount) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;
  }
  var range = sheet.getRange(lastRow, 1, 1, columnCount);
  range.setWrap(true);
  range.setVerticalAlignment('top');
}

/**
 * Delete data rows whose "Գրանցման ID" cell matches registrationId.
 * Header text must stay in sync with SHEET_IDENTITY_COLUMNS.
 */
function deleteRowsByRegistrationId(sheet, registrationId) {
  if (
    typeof registrationId !== 'string' ||
    !/^[A-Za-z0-9_-]{8,64}$/.test(registrationId)
  ) {
    return jsonResponse({ error: 'invalid' });
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return jsonResponse({ ok: true, deleted: 0 });
  }

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idColumn = 0;
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]) === 'Գրանցման ID') {
      idColumn = i + 1;
      break;
    }
  }
  if (idColumn < 1) {
    return jsonResponse({ error: 'id_column_missing' });
  }

  var idValues = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
  var deleted = 0;
  for (var row = idValues.length - 1; row >= 0; row--) {
    if (String(idValues[row][0]) === registrationId) {
      sheet.deleteRow(row + 2);
      deleted++;
    }
  }

  return jsonResponse({ ok: true, deleted: deleted });
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

function demoGeneralHeaders_() {
  return [
    'Գրանցման ID',
    'Ամսաթիվ',
    'Անուն',
    'Ազգանուն',
    'Էլ. փոստ',
    'Հեռախոս',
    'Լեզու',
    'Տոմսի կոդ',
    'Այցելություն',
    'Email կարգավիճակ',
    'UTM source',
    'UTM medium',
    'UTM campaign',
    'Տարիք',
    'Բնակության վայր',
    'Բնակության մանրամասն',
    'Այցի նպատակ',
    'Հետաքրքրող գույք',
    'Արտերկիր — երկիր',
    'Արտերկիր (այլ)',
    'Որտեղ է փնտրում',
    'Երևան — շրջան',
    'Մարզ',
    'Որտեղ (այլ երկիր)',
    'Որտեղ — արտերկիր',
    'Մակերես (քմ)',
    'Ձեռքբերման եղանակ',
    'Ամսական բյուջե',
    'Որոշման փուլ',
    'Ներդրումային գույքի տեսակ',
    'Ներդրումային գույք (այլ)',
    'Ներդրումային շուկա',
    'Ներդրումային շուկա (այլ)',
    'Ներդրումային նպատակ',
    'Ներդրումային ժամկետ',
    'Ներդրումային բյուջե (USD)',
    'Նախորդ ներդրումային փորձ',
    'Նախորդ փորձ (այլ)',
    'Շուկայական հետաքրքրություններ',
    'Հետազոտության նպատակ',
    'Հետաքրքրող վայր',
    'Հետաքրքրող վայր (այլ)',
    'Գնման հորիզոն',
    'Տեղեկագիր',
  ];
}

function demoGeneralRows_() {
  return [
    [
      'reg_ani_sargsyan',
      '16.09.2026 11:20',
      'Անի',
      'Սարգսյան',
      'ani.sargsyan@example.com',
      '+374 91 234 567',
      'Հայերեն',
      'TEANI7K2M9P',
      'Չի այցելել',
      'Ուղարկված',
      'facebook',
      'cpc',
      'toon_expo_2026',
      '25–34',
      'Հայաստան',
      'Երևան',
      'Սեփական բնակարան',
      'Բնակարան',
      '',
      '',
      'Երևան',
      'Կենտրոն, Արաբկիր',
      '',
      '',
      '',
      '60–80',
      'Հիփոթեք',
      '300–500 հազ. դրամ',
      'Ակտիվ որոնում',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '6–12 ամիս',
      'Այո',
    ],
    [
      'reg_davit_hakobyan',
      '16.09.2026 12:05',
      'Դավիթ',
      'Հակոբյան',
      'davit.hakobyan@example.com',
      '+374 93 445 778',
      'Հայերեն',
      'TEDAV4H8Q1R',
      'Այցելել է',
      'Ուղարկված',
      'instagram',
      'social',
      'open_doors',
      '35–44',
      'Հայաստան',
      'Գյումրի',
      'Ներդրում',
      'Բնակարան, Կոմերցիոն',
      '',
      '',
      'Երևան',
      'Դավթաշեն, Աջափնյակ',
      '',
      '',
      '',
      '80–100',
      'Կանխիկ',
      '',
      'Համեմատում է տարբերակները',
      'Բնակարան',
      '',
      'Երևան',
      '',
      'Վարձակալությունից եկամուտ',
      '1–2 տարի',
      '80 000–120 000',
      'Ունի փոքր փորձ',
      '',
      '',
      '',
      '',
      '',
      '',
      'Այո',
    ],
    [
      'reg_mariam_avetisyan',
      '15.09.2026 18:40',
      'Մարիամ',
      'Ավետիսյան',
      'mariam.avet@example.com',
      '+374 55 612 309',
      'Հայերեն',
      'TEMAR2N6W3C',
      'Չի այցելել',
      'Սպասում է',
      'google',
      'search',
      'brand',
      '18–24',
      'Հայաստան',
      'Երևան',
      'Սեփական բնակարան',
      'Բնակարան',
      '',
      '',
      'Երևան',
      'Մալաթիա-Սեբաստիա',
      '',
      '',
      '',
      '40–60',
      'Հիփոթեք',
      '200–300 հազ. դրամ',
      'Հետազոտում է շուկան',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '12+ ամիս',
      'Ոչ',
    ],
    [
      'reg_armen_grigoryan',
      '15.09.2026 16:15',
      'Արմեն',
      'Գրիգորյան',
      'armen.g@example.com',
      '+374 77 901 224',
      'Русский',
      'TEARM9P5L2X',
      'Այցելել է',
      'Ուղարկված',
      'referral',
      'friend',
      '',
      '45–54',
      'Արտերկիր',
      '',
      'Ներդրում',
      'Առանձնատուն',
      'Ռուսաստան',
      '',
      'Մարզ',
      '',
      'Կոտայք, Արարատ',
      '',
      '',
      '100+',
      'Կանխիկ',
      '',
      'Պատրաստ է գնման',
      'Առանձնատուն',
      '',
      'Հայաստան',
      '',
      'Ընտանեկան օգտագործում + ներդրում',
      'մինչև 1 տարի',
      '150 000–250 000',
      'Ունի փորձ',
      '',
      '',
      '',
      'Կոտայք',
      '',
      '0–6 ամիս',
      'Այո',
    ],
    [
      'reg_lilit_ghazaryan',
      '14.09.2026 10:50',
      'Լիլիթ',
      'Ղազարյան',
      'lilit.gh@example.com',
      '+374 98 333 140',
      'Հայերեն',
      'TELIL1V8B4Z',
      'Չի այցելել',
      'Ուղարկված',
      'facebook',
      'cpc',
      'retarget',
      '25–34',
      'Հայաստան',
      'Վանաձոր',
      'Սեփական բնակարան',
      'Բնակարան',
      '',
      '',
      'Երևան',
      'Քանաքեր-Զեյթուն, Նոր Նորք',
      '',
      '',
      '',
      '60–80',
      'Հիփոթեք',
      '300–500 հազ. դրամ',
      'Ակտիվ որոնում',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '6–12 ամիս',
      'Այո',
    ],
  ];
}
