const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getRows } = require('../utils/google.utils');
const { getDetailsForAlbum } = require('../utils/browser.utils');

require('dotenv').config();

const cred = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const dataPath = path.join(__dirname, '../../data/sale-date');
const filesToRun = 55;

const getDetailsForAllAlbums = async (albumList, rows, tries = 20) => {
  let promises = [];
  let allDone = false;
  let currentTries = 0;
  let finalResult = [];
  let currentAlbums = albumList;

  while (!allDone && currentTries < tries) {
    for (let i = 0; i < currentAlbums.length; i += 1) {
      const album = currentAlbums[i];
      const url = album.url.replace('https:https:', 'https:').replace('http:http:', 'http:');

      const albumIndex = rows.findIndex((row) => row.link === url);

      if (albumIndex === -1) {
        promises.push(getDetailsForAlbum({
          url,
          item_type: album.item_type,
          country_code: album.country_code,
        }));
      }
    }

    const currentResult = await Promise.all(promises);

    const good = currentResult.filter((row) => !row.error);
    const errors = currentResult.filter((row) => row.error && row.code !== 'album is gone');
    const goneAlbums = currentResult.filter((row) => row.error && row.code === 'album is gone');

    console.log({
      gl: good.length,
      el: errors.length,
      gaL: goneAlbums.length,
      currentTries,
      tries,
      fal: finalResult.length,
    });

    allDone = errors.length === 0;

    if (!allDone) {
      promises = [];
      currentTries += 1;

      currentAlbums = errors;
    }

    finalResult = [...finalResult, ...good];
  }

  return finalResult;
};

const run = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth(cred);
  await doc.loadInfo();

  const files = fs.readdirSync(dataPath);

  for (let fileIndex = 0; fileIndex < filesToRun; fileIndex += 1) {
    const {
      sheet,
      rowsRaw,
    } = await getRows(doc);
    const lastDate = files.pop();

    const albumList = JSON.parse(fs.readFileSync(path.join(dataPath, lastDate)));

    const allAlbumDetails = await getDetailsForAllAlbums(albumList, rowsRaw);

    console.log({
      lastDate,
      l: albumList.length,
      allAlbumDetails: allAlbumDetails.length,
      fileIndex,
    });

    await sheet.addRows(allAlbumDetails);
    fs.unlinkSync(path.join(dataPath, lastDate));
  }
};

run();
