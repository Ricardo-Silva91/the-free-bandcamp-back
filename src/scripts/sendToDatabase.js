const fs = require('fs');
const path = require('path');
const { getRows, getDoc } = require('../utils/google.utils');
const { getDetailsForAllAlbums } = require('../utils/browser.utils');

const dataPath = path.join(__dirname, '../../data');
const filesToRun = 1;

const sendAlbumsToDatabase = async () => {
  const doc = await getDoc();

  const files = fs.readdirSync(dataPath);

  if (!files.length) {
    console.log('no files');

    return;
  }

  for (let fileIndex = 0; fileIndex < filesToRun; fileIndex += 1) {
    const {
      sheet,
      rowsRaw,
    } = await getRows(doc, 10000, 0);
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

sendAlbumsToDatabase();

module.exports = {
  sendAlbumsToDatabase,
};
