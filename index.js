const { exec } = require('node:child_process');
const { getAuthToken, getSpreadSheetValues, updateSpreadSheetValues } = require('./lib');

const spreadsheetId = '1DdtnaSXvamHc2ABLdTNOE0BNdc-dRZuG-izV11W_QGs';
const spreadsheetName = 'Data';

let auth = null;

async function doAuth() {
  auth = await getAuthToken();
}

async function loop() {
  console.time('timing');
  try {
    const sheetData = await getSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!A1:B10`);
    const values = sheetData.data.values;
    const niftyData = await getData();
    const filterData = niftyData.filter(n => values.some(v => n.strikePrice == v[0])).map(f => ({ ...f, CE: f.CE.lastPrice, PE: f.PE.lastPrice }));
    const cmp = values.map(v => String(filterData.find(f => f.strikePrice == v[0])[v[1]]));
    const update = await updateSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!C1:C10`, [cmp]);
    console.log(update.data.updatedRange, update.data.updatedCells);
  } catch (error) {
    console.error(error.message, error.stack);
  } finally {
    console.timeEnd('timing');
    setTimeout(() => loop(), 1e4);
  }
}

function getData() {
  return new Promise((resolve, reject) => {
    exec(`curl 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY' -H 'authority: www.nseindia.com' -H 'cache-control: max-age=0' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36' --compressed`,
      (error, stdout) => {
        if (error) return reject(error);
        try {
          const json = JSON.parse(stdout);
          const data = json.filtered.data;
          resolve(data);
        } catch (error) {
          reject(error)
        }
      });
  });
}

doAuth().then(() => loop());