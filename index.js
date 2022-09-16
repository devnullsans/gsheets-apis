const { getAuthToken, getSpreadSheetValues, updateSpreadSheetValues } = require('./lib');

const spreadsheetId = '1bVSXPwvFqX-1K1wZ0-6ojekB0DfLuNoGa2wGCwLf_cs';
const spreadsheetName = 'Sheet1';

async function main() {
  try {
    const auth = await getAuthToken();
    console.log('auth', auth.projectId, auth.email, auth.keyId);
    const update = await updateSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!A2:B10`, [[1, 2, 3, 4, 5, 6, 7, 8, 9], ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']]);
    console.log('update', JSON.stringify(update.data, null, 2));
    const value = await getSpreadSheetValues(spreadsheetId, auth, spreadsheetName);
    console.log('value', JSON.stringify(value.data, null, 2));
  } catch (error) {
    console.error(error.message, error.stack);
  }
}

main();