const { GoogleSpreadsheet } = require('google-spreadsheet');
const { writeFile } = require('./fs.utils');

require('dotenv').config();

const cred = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

const getDoc = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth(cred);
  await doc.loadInfo();

  return doc;
};

const getRowCount = async (doc) => {
  const sheet = doc.sheetsByIndex[0];
  const { rowCount } = sheet;

  return rowCount;
};

const getRows = async (doc, offset = 0, limit = 30) => {
  const sheet = doc.sheetsByIndex[0];
  const { rowCount } = sheet;

  console.log({ rowCount });

  const offsetToUse = offset > rowCount ? rowCount : offset;
  const sliceOffset = offsetToUse ? rowCount - offsetToUse : 0;

  console.log({
    rowCount,
    sliceOffset,
    limit,
  });

  const rowsRaw = await sheet.getRows({ offset: sliceOffset, limit });

  console.log({ rr: rowsRaw.length });

  const rowKeys = rowsRaw.length ? Object.keys(rowsRaw[0]).filter((key) => !key.includes('_')) : [];

  const rows = rowsRaw.map((row) => rowKeys.reduce(
    (acc, key) => ({ ...acc, [key]: row[key] }),
    {},
  ));

  return { rows, rowsRaw, sheet };
};

const getVinylRows = async (doc, offset = 0, limit = 0) => {
  const sheet = doc.sheetsByIndex[2];
  const rowsRaw = await sheet.getRows({ offset, limit });

  console.log({ vrr: rowsRaw.length });

  const rowKeys = rowsRaw.length ? Object.keys(rowsRaw[0]).filter((key) => !key.includes('_')) : [];

  const rows = rowsRaw.map((row) => rowKeys.reduce(
    (acc, key) => ({ ...acc, [key]: row[key] }),
    {},
  ));

  return { rows, rowsRaw, sheet };
};

const getAlbumsNotInDb = async (albums, doc) => {
  const { rows } = await getRows(doc);
  const filteredAlbums = albums.filter(
    (album) => {
      const albumIndex = rows.findIndex((row) => row.link === album.link);

      console.log({ albumIndex });

      return albumIndex === -1;
    },
  );

  return filteredAlbums;
};

const replicateDB = async () => {
  const doc = await getDoc();
  const rowCount = await getRowCount(doc);
  const { rows } = await getRows(doc, 0, 0);

  const piece = 10000;
  const slices = Math.floor(rowCount / piece);
  const remainder = rowCount % piece;

  console.log({ slices, remainder, rowCount });

  for (let i = 0; i < slices; i += 1) {
    writeFile(rows.slice(i * piece, i * piece + piece), `./files/db${i}.json`, true);
  }

  writeFile(rows.slice(slices * piece, slices * piece + remainder), `./files/db${slices}.json`, true);
  writeFile({
    piece,
    slices,
    remainder,
  }, './files/macros.json', true);
};

module.exports = {
  getDoc,
  getRowCount,
  getRows,
  getVinylRows,
  getAlbumsNotInDb,
  replicateDB,
};
