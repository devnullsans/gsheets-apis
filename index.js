const { getAuthToken, getSpreadSheet, getSpreadSheetValues } = require('./lib');

const spreadsheetId = '1bVSXPwvFqX-1K1wZ0-6ojekB0DfLuNoGa2wGCwLf_cs';
const spreadsheetName = 'Sheet1';

async function main() {
  try {
    const auth = await getAuthToken();
    console.log('auth', auth.projectId, auth.email, auth.keyId);
    const sheet = await getSpreadSheet(spreadsheetId, auth);
    console.log('sheet', JSON.stringify(sheet.data, null, 2));
    const value = await getSpreadSheetValues(spreadsheetId, auth, spreadsheetName);
    console.log('value', JSON.stringify(value.data, null, 2));
  } catch (error) {
    console.error(error.message, error.stack);
  }
}

main();