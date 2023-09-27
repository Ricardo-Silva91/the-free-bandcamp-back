const fs = require('fs');
const path = require('path');
const { getRows, getDoc, getRowCount, getRowsToSave, saveRows, clearDaySheet } = require('../utils/google.utils');
const { getDetailsForAllAlbums } = require('../utils/browser.utils');

const cleanDatabase = async () => {
  const doc = await getDoc();
  const rowCount = await getRowCount(doc);
  const rowsToSave = await getRowsToSave(doc);
  
  console.log('cleaning', { rowCount, rowsToSave });

  await saveRows(doc, rowsToSave.rowsRaw);

  await clearDaySheet(doc);
};

cleanDatabase();

module.exports = {
  cleanDatabase,
};
