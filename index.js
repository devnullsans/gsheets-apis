const { exec } = require('node:child_process');
const { getAuthToken, getSpreadSheetValues, updateSpreadSheetValues } = require('./lib');

const spreadsheetId = '1DdtnaSXvamHc2ABLdTNOE0BNdc-dRZuG-izV11W_QGs';
const spreadsheetName = 'Data';

let auth = null;

async function doAuth() {
  auth = await getAuthToken();
}

let time = null;

async function loop() {
  time = Date.now();
  try {
    const sheetData = await getSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!A1:C10`);
    const values = sheetData.data.values;
    const niftyData = await getData();
    const filterData = niftyData.filter(n => values.some(v => (n.expiryDate == v[0] && n.strikePrice == v[1])));
    const cmp = values.map(v => String(filterData.find(f => (f.expiryDate == v[0] && f.strikePrice == v[1]))[v[2]]?.lastPrice));
    const update = await updateSpreadSheetValues(spreadsheetId, auth, `${spreadsheetName}!D1:D10`, [cmp]);
    console.log(update.data.updatedRange, update.data.updatedCells);
  } catch (error) {
    console.error(error.message, error.stack);
  } finally {
    setTimeout(() => loop(), 15e3 - (Date.now() - time));
  }
}

function getData() {
  return new Promise((resolve, reject) => {
    exec(
      `curl 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY' -H 'authority: www.nseindia.com' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'accept-language: en-GB,en;q=0.9' -H 'sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="104"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "Linux"' -H 'sec-fetch-dest: document' -H 'sec-fetch-mode: navigate' -H 'sec-fetch-site: none' -H 'sec-fetch-user: ?1' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36' --compressed`,
      (error, stdout) => {
        if (error) return reject(error);
        try {
          const json = JSON.parse(stdout);
          const data = json.records.data;
          resolve(data);
        } catch (error) {
          reject(error)
        }
      });
  });
}

doAuth().then(() => loop());