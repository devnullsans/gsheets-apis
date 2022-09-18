const https = require('https');
const zlib = require('zlib');

function makeReq() {
  return new Promise((resolve, reject) => {
    https.get('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', {
      port: 443,
      headers: {
        'Host': 'www.nseindia.com',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    }, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
      const contentEncoding = res.headers['content-encoding'];
      console.log(statusCode, contentType, contentEncoding);
      if (statusCode !== 200) {
        res.resume();
        reject(new Error('Request Failed.\n' + `Status Code: ${statusCode}`));
      } else if (!/^application\/json/.test(contentType)) {
        res.resume();
        reject(new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType} with Status Code: ${statusCode}`));
      } else if (contentEncoding === 'gzip') {
        let rawData = '';
        const gzip = zlib.createGunzip();
        gzip.on('data', (chunk) => { rawData += chunk; });
        gzip.once('error', e => reject(e));
        gzip.once('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(e);
          }
        });
        res.pipe(gzip);
      } else {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.once('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(e);
          }
        });
      }
    }).on('error', (e) => reject(e));
  });
}

makeReq().then(console.log).catch(console.error);