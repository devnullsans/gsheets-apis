const makeReq = require('./httptest');
const { getAuthToken, getSpreadSheetValues, updateSpreadSheetValues } = require('./lib');

const spreadsheetId = '1DdtnaSXvamHc2ABLdTNOE0BNdc-dRZuG-izV11W_QGs';
const spreadsheetName = 'Data';

let auth = null;

async function doAuth() {
  auth = await getAuthToken();
}

let time = null;
let delay = new Date();

async function loop() {
  time = new Date();
  try {
    const sheetData = await getSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!A1:C10`);
    const values = sheetData.data.values;
    const t1 = new Date();
    const niftyData = await makeReq();
    const filterData = niftyData.filter(n => values.some(v => (n.expiryDate == v[0] && n.strikePrice == v[1])));
    const cmp = values.map(v => String(filterData.find(f => (f.expiryDate == v[0] && f.strikePrice == v[1]))[v[2]]?.lastPrice));
    const t2 = new Date();
    const update = await updateSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!D1:E10`, [cmp, [time.toLocaleString('en-GB'), t1.toLocaleString('en-GB'), t2.toLocaleString('en-GB'), delay.toLocaleString('en-GB')]]);
    console.log(update.data.updatedRange, update.data.updatedCells);
  } catch (error) {
    console.error(error.message);
  } finally {
    delay = new Date();
    setTimeout(() => loop(), 15e3 - (delay.getTime() - time.getTime()));
  }
}

doAuth().then(() => loop());