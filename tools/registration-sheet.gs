// Google Apps Script for the tournament registration sheet.
//
// Setup (on the club Google account):
// 1. Create a Google Sheet, e.g. "City of Roses 2027 Registrations".
// 2. In the sheet, open Extensions > Apps Script, delete what's there, and
//    paste in this whole file. Save.
// 3. Click Deploy > New deployment. Type: Web app. Execute as: Me.
//    Who has access: Anyone. Click Deploy and allow access when asked.
// 4. Copy the Web app URL (ends in /exec) into sheetEndpoint in
//    assets/tournament.js.
//
// Each registration adds one row to the "Registrations" tab. Match payments
// in Stripe by the Registration ID (shown as the client reference ID), then
// fill in the Paid column.

var SHEET_NAME = "Registrations";

var COLUMNS = [
  ["Submitted", null],
  ["Registration ID", "registration_id"],
  ["Paid", null],
  ["First name", "first_name"],
  ["Last name", "last_name"],
  ["Club", "club"],
  ["Events", "events"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["HEMA Ratings ID", "hema_ratings_id"],
  ["Age group", "age_group"],
  ["Parent or guardian", "guardian_name"],
  ["Emergency contact", "emergency_contact_name"],
  ["Emergency phone", "emergency_contact_phone"],
  ["Agrees to waivers", "agrees_to_waivers"],
  ["Has required gear", "has_required_gear"]
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.botcheck) return ContentService.createTextOutput("ok");

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(function (c) { return c[0]; }));
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(COLUMNS.map(function (c) {
      if (c[0] === "Submitted") return new Date();
      return c[1] ? asText(p[c[1]]) : "";
    }));
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

// Keep typed values as plain text so nothing is read as a formula.
function asText(value) {
  var v = String(value || "").slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
