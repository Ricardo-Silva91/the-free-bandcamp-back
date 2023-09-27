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

const getRowCount = async (doc, sheetId = 0) => {
  const sheet = doc.sheetsById[sheetId];
  const { rowCount } = sheet;

  return rowCount;
};

const getRows = async (doc, offset = 0, limit = 1000, options = { sheetId: 0 }) => {
  const sheet = doc.sheetsByIndex[options.sheetId];
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

const getRowsToSave = async (doc) => {
  const { rows, rowsRaw } = await getRows(doc);

  const result = rows.reduce((acc, row, index) => row.shouldSave === 'TRUE' ? ({ rows: [...acc.rows, row], rowsRaw: [...acc.rowsRaw, rowsRaw[index]] }) : acc, { rows: [], rowsRaw: [] });

  return result;
}

const saveRows = async (doc, rowsRaw = []) => {
  const saveSheetId = 183508155;
  const saveSheet = doc.sheetsById[saveSheetId];
  const saveRowsCount = await getRowCount(doc, saveSheetId);

  await saveSheet.addRows(rowsRaw);

  console.log(saveRowsCount);
}

const clearDaySheet = async (doc) => {
  const daySheet = doc.sheetsById[0];

  await daySheet.clearRows();
}

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
  getRowsToSave,
  getVinylRows,
  getAlbumsNotInDb,
  replicateDB,
  saveRows,
  clearDaySheet,
};
