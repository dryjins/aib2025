/**
 * Minimal Web App receiver for MVP logging.
 * Expects JSON: { event: "cta_click", variant: "B", userId: "...", ts: 1699999999999 }
 * Returns JSON { ok: true } on success.
 */
function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName('logs') || ss.insertSheet('logs');
    if (sh.getLastRow() === 0) {
      sh.appendRow(['ts_iso','event','variant','userId','meta']); // header
    }
    const tsIso = body.ts ? new Date(body.ts).toISOString() : new Date().toISOString();
    sh.appendRow([tsIso, body.event || '', body.variant || '', body.userId || '', JSON.stringify(body.meta || {})]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
