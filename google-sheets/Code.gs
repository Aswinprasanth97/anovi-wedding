/**
 * RSVP webhook — receives RSVP submissions from the wedding site and
 * appends them as a row in the bound Google Sheet.
 *
 * Setup: see README.md in this folder.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted At", "Name", "Phone", "Email", "Attending", "Adults", "Children", "Message"]);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    data.phone || "",
    data.email || "",
    data.attending || "",
    data.adults || "",
    data.children || "",
    data.message || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
