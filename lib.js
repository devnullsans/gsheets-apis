const { join } = require('path');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// GCLOUD_PROJECT env needs to be set with your-project-id
const auth = new google.auth.GoogleAuth({
  keyFile: join(process.cwd(),'keys.json'),
  scopes: SCOPES
});

async function getAuthToken() {
  return await auth.getClient();
}

async function getSpreadSheet(spreadsheetId, auth) {
  return await sheets.spreadsheets.get({ spreadsheetId, auth });
}

async function getSpreadSheetValues(spreadsheetId, auth, range) {
  return await sheets.spreadsheets.values.get({ spreadsheetId, auth, range });
}

module.exports = {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues
};